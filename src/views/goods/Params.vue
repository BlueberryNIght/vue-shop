<template>
  <div>
    <wrap :title="['商品管理', '参数列表']">
      <div slot="card">
        <!-- 警告区域 -->
        <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning"></el-alert>
        <!-- 商品分类区域 -->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <!-- 三级联动选择区 -->
            <el-cascader
              v-model="selectedOptions2"
              :options="cateList"
              :props="cateProps"
              @change="selectedCateChange"
            ></el-cascader>
          </el-col>
        </el-row>
        <!-- tabs选项卡切换 -->
        <el-tabs v-model="activeName" @tab-click="tabClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParams">添加参数</el-button>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button
              type="primary"
              size="mini"
              :disabled="isBtnDisabled"
              @click="addAttribute"
            >添加属性</el-button>
          </el-tab-pane>
        </el-tabs>
        <!-- 对应参数表格 -->
        <el-table :data="getParamsList" border>
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-tag
                :key="i"
                v-for="(item, i) in scope.row.attr_vals"
                closable
                @close="handleClose(scope.row, i)"
              >{{item}}</el-tag>
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              ></el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(scope.row)"
              >+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="editParamsDate(scope.row.attr_id)"
              >修改</el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteParamasDate(scope.row.attr_id)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 添加属性/参数对话框 -->
        <el-dialog
          :title="'添加' + titleTxt"
          :visible.sync="aadFormDialogVisible"
          width="50%"
          @close="addDialogClose"
        >
          <el-form
            :model="addForm"
            :rules="addFormRules"
            ref="addParamsFormRef"
            label-width="100px"
          >
            <el-form-item :label="titleTxt" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="aadFormDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParmas">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改属性/参数对话框 -->
        <el-dialog
          :title="'修改' + titleTxt"
          :visible.sync="editFormDialogVisible"
          width="50%"
          @close="editDialogClose"
        >
          <el-form
            :model="editForm"
            :rules="addFormRules"
            ref="editParamsFormRef"
            label-width="100px"
          >
            <el-form-item :label="titleTxt" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editFormDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParmas">确 定</el-button>
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
      cateList: [],
      options: {},
      selectedOptions2: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      activeName: "many",
      getParamsList: [],
      aadFormDialogVisible: false,
      editFormDialogVisible: false,
      addForm: {},
      editForm: {
        attr_name: ""
      },
      addFormRules: {
        attr_name: [
          { required: true, message: "请填写活动形式", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    // 根据选项卡是否选择内容判断
    isBtnDisabled() {
      return this.selectedOptions2.length < 3;
    },
    // 获取选中后的id
    cateId() {
      if (this.selectedOptions2.length === 3) {
        return this.selectedOptions2[2];
      } else {
        return 0;
      }
    },
    // 动态获取是添加属性还是参数
    titleTxt() {
      if (this.activeName === "only") {
        return "静态属性";
      } else {
        return "动态参数";
      }
    }
  },
  methods: {
    // 获取联动选择框数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.cateList = res.data;
    },
    // 三级联动选择后触发
    selectedCateChange() {
      // 根据数组的length===3判断是否选择的为三级分类
      if (this.selectedOptions2.length !== 3) {
        this.selectedOptions2 = []; //不是三级分类则清空选择框并返回
        this.getParamsList = []
        return this.$message.info("请选择第三级分类设置相关参数！");
      }
      this.getParamsDate();
    },
    //选择分类后进行参数获取
    async getParamsDate() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      res.data.forEach(item => {
        // 控制文本框的显示/隐藏
        item.inputVisible = false;
        // 存放New Tag 的输入值
        item.inputValue = "";
        item.attr_vals = item.attr_vals
          ? (item.attr_vals || "").split(",")
          : [];
      });
      console.log(res.data);

      this.getParamsList = res.data;
    },
    // 标签页/选项卡切换
    tabClick() {
      this.getParamsDate();
    },
    // 添加动态参数
    addParams() {
      this.aadFormDialogVisible = true;
    },
    // 添加静态属性
    addAttribute() {
      this.aadFormDialogVisible = true;
    },
    // 对话框关闭时
    addDialogClose() {
      this.$refs.addParamsFormRef.resetFields();
    },
    editDialogClose() {
      this.$refs.editParamsFormRef.resetFields();
    },
    // 添加参数/属性
    async addParmas() {
      // 根据activeName判断是参数还是属性
      this.$refs.addParamsFormRef.validate(valid => {
        if (!valid) return;
      });
      const { data: res } = await this.$http.post(
        `categories/${this.cateId}/attributes`,
        {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }
      );
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
      this.getParamsDate();
      this.aadFormDialogVisible = false;
    },
    // 获取修改参数/属性信息
    async editParamsDate(attr_id) {
      this.editFormDialogVisible = true;
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          attr_sel: this.activeName
        }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editForm = res.data;
    },
    // 修改参数/属性提交
    async editParmas() {
      this.$refs.editParamsFormRef.validate(valid => {
        if (!valid) return;
      });
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
        {
          attr_sel: this.activeName,
          attr_name: this.editForm.attr_name
        }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getParamsDate();
      this.editFormDialogVisible = false;
    },
    // 删除参数/属性
    async deleteParamasDate(attr_id) {
      const confrimResult = await this.$confrim(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (confrimResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getParamsDate();
    },
    // 将对attr_valus 数据保存到数据库
    async seveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
    },
    // 删除tab
    handleClose(row, i) {
      row.attr_vals.splice(i, 1);
      this.seveAttrVals(row)
    },
    // New Tag里的文本框失T去焦点或者摁下恩enter后触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length !== 0) {
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = "";
        // 向服务器发送请求存储inputValue
        this.seveAttrVals(row);
      }
      row.inputVisible = false;
    },
    // New Tag 的按钮点击事件
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    }
  }
};
</script>

<style>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px 5px;
}
.input-new-tag,
.button-new-tag {
  margin-left: 5px;
}
.input-new-tag {
  width: 150px;
}
</style>