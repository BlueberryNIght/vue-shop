<template>
  <wrap :title="['订单管理', '订单列表']">
    <div slot="card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="order.query" @clear="clearQuery">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 商品列表展示 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="100"></el-table-column>
        <el-table-column label="是否付款" width="100">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="100"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="150">
          <template v-slot="scope">{{scope.row.create_time | getCreateTime}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editOrder"></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showOrderInfo(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="order.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="order.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editFormClose">
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="editress1">
            <el-cascader
              v-model="editForm.editress1"
              :options="cityDate"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="editress2">
            <el-input v-model="editForm.editress2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
      <!--  物流查看 -->
      <el-dialog title="修改地址" :visible.sync="showDialogVisible" width="50%">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in showInfo"
            :key="index"
            :timestamp="item.time"
          >{{item.context}}</el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="showDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </wrap>
</template>

<script>
import Wrap from "components/Wrap";
import { formatDate } from "../../common/utils";
import cityDate from "../../common/citydata";
export default {
  components: {
    Wrap
  },
  data() {
    return {
      order: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      //   订单管理列表
      ordersList: [],
      total: 0,
      editDialogVisible: false,
      showDialogVisible: false,
      editForm: {
        editress1: [],
        editress2: ""
      },
      editRules: {
        editress1: [
          { required: true, message: "请选择省市区/县地址", trigger: "blur" }
        ],
        editress2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      cityDate,
      showInfo: []
    };
  },
  created() {
    this.getOrdersList();
  },
  filters: {
    getCreateTime(val) {
      let date = new Date(val * 1000);
      return formatDate(date, "yyyy-MM-dd hh:mm:ss");
    }
  },
  methods: {
    //   获取订单数据列表
    async getOrdersList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.order
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.ordersList = res.data.goods;
      this.total = res.data.total;
    },
    // 页码切换大小变化
    handleSizeChange(newSize) {
      this.order.pagesize = newSize;
      this.getOrdersList();
    },
    // 点击页码变化
    handleCurrentChange(newPage) {
      this.order.pagenum = newPage;
      this.getOrdersList();
    },
    // 清空搜索框
    clearQuery() {
      this.getOrdersList();
    },
    // 修改订单列表
    editOrder() {
      this.editDialogVisible = true;
    },
    // 关闭对话框
    editFormClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 查看订单详情
    async showOrderInfo(row) {
      console.log(row);
      this.showDialogVisible = true;
      const { data: res } = await this.$http.get("/kuaidi/804909574412544580");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.showInfo = res.data;
      console.log(res.data);
      
    }
  }
};
</script>

<style>
.el-pagination {
  margin-top: 10px;
}
</style>