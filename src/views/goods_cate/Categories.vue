<template>
  <div>
    <wrap :title="['商品管理', '商品分类']">
      <div slot="card">
        <el-row>
          <el-col>
            <el-button type="primary" @click="addCate">添加分类</el-button>
          </el-col>
        </el-row>
        <!-- 商品分类表格 -->
        <tree-table
          class="tree-table"
          :data="categoriesList"
          :columns="columns"
          :show-index="true"
          :selection-type="false"
          :expand-type="false"
          :border="true"
        >
          <!-- 是否有效 -->
          <template v-slot:isOK="scope">
            <i class="el-icon-success icon" v-if="scope.row.cat_deleted"></i>
            <i class="el-icon-error icon" v-else></i>
          </template>
          <!-- 排序 -->
          <template v-slot:order="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="warning" v-else-if="scope.row.cat_level === 2">三级</el-tag>
          </template>
          <!-- 操作功能区 -->
          <template v-slot:opt="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editCateById(scope.row.cat_id)"
            >修改</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delet"
              @click="deleteCateById(scope.row.cat_id)"
            >删除</el-button>
          </template>
        </tree-table>
        <!-- 分页效果 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
        <!-- 添加分类弹窗 -->
        <el-dialog
          title="添加分类"
          :visible.sync="addCateDialogVisible"
          width="50%"
          @close="addCateDialogClose"
        >
          <el-form :model="addRuleForm" :rules="addCateFormRules" ref="ruleForm" label-width="80px">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="addRuleForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
              <!-- 两级联动 -->
              <el-cascader
                v-model="selectedKeys"
                expand-trigger="hover"
                :options="getParentCateDate"
                :props="cateProps"
                clearable
                @change="ParentCateChange"
              ></el-cascader>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitAddCate">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改分类对话框 -->
        <el-dialog title="修改分类" :visible.sync="editCatedialogVisible" width="50%">
          <el-form
            :model="editCateForm"
            :rules="addCateFormRules"
            ref="editFormRef"
            label-width="80px"
          >
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="editCateForm.cat_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editCatedialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitEditCate">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </wrap>
  </div>
</template>

<script>
import Wrap from "components/Wrap";
export default {
  components: {
    Wrap
  },
  data() {
    return {
      // 获取商品分类数据
      categoriesList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 定义为自定义模板列
          type: "template",
          // 定义当前列的模板名称
          template: "isOK"
        },
        {
          label: "排序",
          type: "template",
          // 定义当前列的模板名称
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      addCateDialogVisible: false,
      editCatedialogVisible: false,
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      addRuleForm: {
        cat_name: "",
        cat_pid: 0, //分类父 ID
        cat_level: 0 //分类层级
      },
      getParentCateDate: [],
      cateProps: {
        value: "cat_id", // 指定你选中的值
        label: "cat_name", // 指定你看到的值
        children: "children", // 父子嵌套属性
        checkStrictly: true
      },
      selectedKeys: [], //下拉框选择的值
      editCateForm: {
        cat_name: "",
        cat_id: 0
      }
    };
  },
  created() {
    this.getCategroiesDate();
  },
  methods: {
    async getCategroiesDate() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.categoriesList = res.data.result;
      this.total = res.data.total;
    },
    // 每页显示数据条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCategroiesDate();
    },
    // 切换页码
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCategroiesDate();
    },
    // 添加分类
    addCate() {
      this.getParentCate();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类
    async getParentCate() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2
        }
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getParentCateDate = res.data;
    },
    ParentCateChange() {
      // 如果selectedKeys数组中的length大于0则表示选中了父级分类
      // 反之，则表示没有选中任何父级
      if (this.selectedKeys.length > 0) {
        // 重新设置他的父级id
        this.addRuleForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 重新设置分类层级
        this.addRuleForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addRuleForm.cat_pid = 0;
        this.addRuleForm.cat_level = 0;
      }
    },
    //弹窗关闭监听
    addCateDialogClose() {
      this.$refs.ruleForm.resetFields();
      this.selectedKeys = [];
      this.addRuleForm.cat_pid = 0;
      this.addRuleForm.cat_level = 0;
    },
    async submitAddCate() {
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) return this.$message.error("请正确填写信息");
      });
      const { data: res } = await this.$http.post(
        "categories",
        this.addRuleForm
      );
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
      this.addCateDialogVisible = false;
      this.getCategroiesDate();
    },
    // 修改分类
    async editCateById(cateId) {
      this.editCatedialogVisible = true;
      const { data: res } = await this.$http.get("categories/" + cateId);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editCateForm.cat_id = res.data.cat_id;
      this.editCateForm.cat_name = res.data.cat_name;
    },
    async submitEditCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error("请正确填写信息");
      });
      const { data: res } = await this.$http.put(
        "categories/" + this.editCateForm.cat_id,
        this.editCateForm
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getCategroiesDate();
      this.editCatedialogVisible = false;
    },
    // 删除分类
    async deleteCateById(cateId) {
         const confrimResult = await this.$confrim(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      //点击确定返回confirm字符串
      //点击取消返回cancel字符
      // console.log(confrimResult);
      if (confrimResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("categories/" + cateId);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getCategroiesDate()
    }
  }
};
</script>

<style scoped>
.tree-table,
.el-pagination {
  margin-top: 15px;
}
.icon {
  color: rgb(32, 178, 170);
}
.el-cascader {
  width: 100%;
}
</style>