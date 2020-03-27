<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 输入框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="search">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 切换开关 -->
          <template v-slot="scope">
            <!-- 定义作用域插槽接收数据再传值（作用域插槽覆盖prop ） -->
            <el-switch v-model="scope.row.mg_state" @change="userStadeChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作" width="180px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deletUserById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" @close="addDialogClose" :visible.sync="dialogVisible" width="50%">
      <!-- 嵌套表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFrom">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密 码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮 箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" @close="editDialogClose" :visible.sync="editdialogVisible" width="50%">
      <!-- 嵌套表单 -->
      <el-form :model="editForm" :rules="addFormRules" ref="editFromRef">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮 箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义手机号规则(规则-正则表达式，value，回调函数)
    const checkMobil = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法手机号"));
    };
    return {
      // 获取用户列表参数对象
      queryInfo: {
        //查询
        query: "",
        // 当前页数
        pagenum: 1,
        // 当前页显示几条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      //控制对话框的显示/隐藏
      dialogVisible: false,
      editdialogVisible: false,
      // 添加用户表单参数
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 修改用户表单参数
      editForm: {},
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 15, message: "长度在 3 到 15 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱地址", trigger: "blur" },
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          // 自定义手机规则引入validator: checkMobil,
          { validator: checkMobil, trigger: "blur" }
        ]
      },
      formLabelWidth: "70px"
    };
  },
  created() {
    this.getUsedrs();
  },
  methods: {
    // 请求管理员列表
    async getUsedrs() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pageSize 改变触发事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUsedrs();
    },
    // 监听页码值 改变触发事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUsedrs();
    },
    // switch开关切换监听
    async userStadeChanged(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        this.$message.error("状态更新失败！");
      }
    },
    // 搜索
    search() {
      this.queryInfo.pagenum = 1;
      this.getUsedrs();
    },
    // 监听添加用户对话框的关闭重置表单
    addDialogClose() {
      this.$refs.addFrom.resetFields();
    },
    // 表单提交预校验
    addUser() {
      this.$refs.addFrom.validate(async valid => {
        if (!valid) return;
        // 发起添加用户请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.$message.success("添加用户成功");
        // 隐藏对话框
        this.dialogVisible = false;
        // 重新获取用户数据
        this.getUsedrs();
      });
    },
    // 修改按钮点击事件--根据id查询用户信息
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editForm = res.data;
      this.editdialogVisible = true;
    },
    // 修改用户数据重置表单
    editDialogClose() {
      this.$refs.editFromRef.resetFields();
    },
    // 提交修改用户数据
    editUserInfo() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.editdialogVisible = false;
        this.getUsedrs();
        this.$message.success(res.meta.msg);
      });
    },
    async deletUserById(id) {
      // this.$confrim 的返回值是个promise
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
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getUsedrs();
    }
  }
};
</script>

<style>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 12px;
}
.el-card {
  margin-top: 15px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
}
.el-table {
  margin: 15px 0;
  font-size: 12px;
}
</style>