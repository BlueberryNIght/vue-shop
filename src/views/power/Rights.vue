<template>
  <div>
    <wrap :title="['权限管理', '权限列表']">
      <div slot="card">
        <!-- 表格 -->
        <el-table :data="rightsData" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="authName" label="权限名称"></el-table-column>
          <el-table-column prop="path" label="路径"></el-table-column>
          <el-table-column prop="level" label="权限等级">
            <template v-slot="scope">
              <el-tag v-if="scope.row.level === '0'">一级</el-tag>
              <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
              <el-tag type="warning" v-else>三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
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
      rightsData: []
    };
  },
  created() {
    this.getRightsDate();
  },
  methods: {
    //   获取列表权限
    async getRightsDate() {
      const { data: res } = await this.$http.get("rights/list");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.rightsData = res.data;
    }
  }
};
</script>

<style>
</style>