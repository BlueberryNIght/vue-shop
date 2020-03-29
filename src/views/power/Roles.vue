<template>
  <div>
    <wrap :title="['权限管理', '角色列表']">
      <div slot="card">
        <!-- 添加角色按钮区域 -->
        <el-row>
          <el-col>
            <el-button type="primary" @click="addNewRoles">添加角色</el-button>
          </el-col>
        </el-row>
        <!-- 角色列表 -->
        <el-table :data="rolesData" border stripe>
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-row
                v-for="(item1, index1) in scope.row.children"
                :key="item1.id"
                :class="['bgbottom',index1 === 0 ? 'bgtop': '', 'vcenter' ]"
              >
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable>{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二三级权限 -->
                <el-col :span="19">
                  <!-- 二级权限 -->
                  <el-row
                    v-for="(item2, index2) in item1.children"
                    :key="item2.id"
                    :class="[index2 === 0? '' : 'bgtop', 'vcenter']"
                  >
                    <el-col :span="6">
                      <el-tag type="success" closable>{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        type="warning"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        closable
                        @close="removeRightById(scope.row, item3.id)"
                      >{{item3.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="角色操作" width="300px">
            <template v-slot="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="editRoleInfo(scope.row)"
              >编辑</el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteRole(scope.row.id)"
              >删除</el-button>
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRightDialog(scope.row)"
              >分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </wrap>
    <!-- 添加用户弹框 -->
    <el-dialog title="添加用户" @close="editDialogClose" :visible.sync="RolesDialogVisible" width="50%">
      <el-form ref="addFormRef" :model="addForm" :rules="addRolesRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="RolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户弹框 -->
    <el-dialog title="修改用户" :visible.sync="editRolesDialogVisible" width="50%">
      <el-form ref="editFormRef" :model="editForm" :rules="addRolesRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <!-- 修改用户弹框 -->
    <el-dialog title="分配权限" :visible.sync="setRightRolesDialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="setRightProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
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
      RolesDialogVisible: false,
      editRolesDialogVisible: false,
      rolesData: [],
      //添加角色
      addForm: {
        query: "",
        roleName: "",
        roleDesc: ""
      },
      editForm: {},
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      },
      formLabelWidth: "100px",
      setRightRolesDialogVisible: false,
      // 分配权限数据存放
      rightsList: [],
      setRightProps: {
        children: "children",
        label: "authName" //将要访问的是autname
      },
      defKeys: [],
      roleId: ""
    };
  },
  created() {
    this.getRolesDate();
  },
  methods: {
    //数据列表请求
    async getRolesDate() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.rolesData = res.data;
    },
    //点击弹框显示
    addNewRoles() {
      this.RolesDialogVisible = true;
    },
    // 弹框关闭前重置表单
    editDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 新添用户提交
    async addRoleInfo() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.RolesDialogVisible = false;
        this.getRolesDate();
      });
    },
    // 编辑用户信息
    async editRoleInfo(item) {
      const { data: res } = await this.$http.put("roles/" + item.id, {
        roleName: item.roleName,
        roleDesc: item.roleDesc
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editForm = res.data;
      this.editRolesDialogVisible = true;
    },
    submitInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.editRolesDialogVisible = false;
        this.getRolesDate();
      });
    },
    async deleteRole(id) {
      const confrimResult = await this.$confrim(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      console.log(confrimResult);

      if (confrimResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      console.log(res);

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getRolesDate();
    },
    // 删除角色下指定权限
    async removeRightById(role, rightId) {
      const confirmRresult = await this.$confrim(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (confirmRresult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      role.children = res.data;
    },
    async showSetRightDialog(role) {
      this.defKeys = [];
      this.roleId = role.id;
      // 获取所有用户权限tree
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.rightsList = res.data;
      this.getLeafKeys(role, this.defKeys);
      this.setRightRolesDialogVisible = true;
    },
    // 通过递归方式获取三级权限的id数组defKeys
    getLeafKeys(node, arr) {
      // 如果当前node节点没有childern 则将id值push到arr中并返回
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr =  keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesDate()
      this.setRightRolesDialogVisible = false
      
    }
  }
};
</script>

<style>
.el-tag {
  margin: 7px;
}
.bgtop {
  border-top: 1px solid #eee;
}
.bgbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>