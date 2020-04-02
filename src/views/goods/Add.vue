<template>
  <div>
    <wrap :title="['商品管理', '添加商品']">
      <div slot="card">
        <el-alert :closable="false" center show-icon title="添加商品信息" type="info"></el-alert>
        <!-- 表单 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-position="top"
          label-width="100px"
        >
          <!-- 步骤条 -->
          <el-steps :space="200" :active="activeIndex*1" finish-status="success">
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="商品完成"></el-step>
          </el-steps>
          <!-- 标签页 -->
          <el-tabs
            :before-leave="beforeLeave"
            @tab-click="tabClick"
            :tab-position="tabPosition"
            v-model="activeIndex"
          >
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
              <!-- 联动选择器 -->
              <el-form-item label="商品分类" prop="selectedCate">
                <el-cascader
                  v-model="selectedCate"
                  :options="categorList"
                  :props="cateProps"
                  @change="handleChange"
                ></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="item in paramsTab " :key="item.attr_id">
                <!-- 多选框数组 -->
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item
                :label="item.attr_name"
                v-for="item in attributeTab"
                :key="item.arrt_id"
              >
                <el-input v-model="item.attr_vals[0]"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <!-- 图片上传 -->
              <el-upload
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess"
              >
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce" />
              <el-button type="primary" class="add" @click="add">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <!-- 图片预览弹框 -->
        <el-dialog title="图片预览" :visible.sync="imgDialogVisible" width="50%">
          <img :src="previewPath" />
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
      tabPosition: "left",
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_cat: "",
        goods_number: 0,
        // 存放图片临时路径数组
        pics: [],
        // 商品详情描述
        goods_introduce: "",
        //商品的参数/属性合成的（数组）
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ]
      },
      categorList: [],
      selectedCate: "",
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      //获取的动态参数/属性
      paramsTab: [],
      attributeTab: [],
      // 图片上传提交地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      // 设置图片上传是时的请求头获得token
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 图片预览地址存放
      previewPath: "",
      imgDialogVisible: false
    };
  },
  created() {
    //获取商品分类列表
    this.getCategoryList();
  },
  computed: {
    getCateId() {
      if (this.selectedCate.length === 3) {
        return this.selectedCate[2];
      }
      return null;
    },
    getSel() {
      if (this.activeIndex === "1") {
        return "many";
      }
      return "only";
    }
  },
  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.categorList = res.data;
    },
    // 联动选择器选中触发事件
    handleChange() {
      if (this.selectedCate.length < 3) {
        this.selectedCate = [];
        return this.$message.info("只能选择三级分类");
      }
    },
    // activeName :即将进入的标签页, oldActiveName： 即将离开的标签页
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.selectedCate.length < 3) {
        this.$message.error("请完善商品分类信息");
        return false;
      }
    },
    // 标签页切换点击
    async tabClick() {
      //发送获取参数/属性请求
      if (this.activeIndex === "1" || this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.getCateId}/attributes`,
          {
            params: {
              sel: this.getSel
            }
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        // 将attr_vals切割成数组
        res.data.forEach(item => {
          return (item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(","));
        });
        if (this.activeIndex === "1") {
          this.paramsTab = res.data;
        } else if (this.activeIndex === "2") {
          this.attributeTab = res.data;
        }
      }
    },
    // 图片缩略图触发事件
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.imgDialogVisible = true;
    },
    // 图片移除事件 file: 当前文件
    handleRemove(file) {
      // 获取被删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 找到对应数组的下标
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      // 删除i
      this.addForm.pics.splice(i, 1);
    },
    // 图片上传成功后执行 response 服务器返回的数据
    handleSuccess(response) {
      // 1. 将拼接得到一个图片信息
      // 2. 将图片信息添加到pics 地址数组中
      const picInfo = {
        pic: response.data.tmp_path
      };
      this.addForm.pics.push(picInfo);
    },
    // 添加商品
    async add() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return this.$message.error("请输入必填栏目信息");
        this.addForm.goods_cat = this.selectedCate.join(",");
        console.log(this.paramsTab);
        console.log(this.attributeTab);

        this.paramsTab.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        this.attributeTab.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
      });
      // 发送添加商品请求
      const { data: res } = await this.$http.post("goods", this.addForm);
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
      this.$router.push('/goods')
      
    }
  }
};
</script>

<style>
.el-alert__icon {
  font-size: 16px;
  width: 16px;
}
.el-steps {
  margin: 10px 0;
  display: flex;
  justify-content: center;
}
.el-step__title {
  font-size: 13px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.el-dialog img {
  width: 100%;
}
.ql-editor {
  min-height: 300px;
}
.add {
  margin: 15px 0;
}
</style>