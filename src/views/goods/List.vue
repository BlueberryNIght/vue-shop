<template>
  <div>
    <wrap :title="['商品管理', '商品列表']">
      <div slot="card">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" clearable v-model="goods.query" @clear="clearQuery">
              <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
            </el-input>
          </el-col>
          <el-col :span="16">
            <el-button type="primary" @click="goodsAdd">添加商品</el-button>
          </el-col>
        </el-row>
        <!-- 商品列表展示 -->
        <el-table :data="goodsList" border stripe>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column label="商品价格（元）" prop="goods_price" width="110"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight" width="70"></el-table-column>
          <el-table-column label="创建时间" width="130">
            <template v-slot="scope">{{scope.row.add_time | showDate}}</template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoods"></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteGoods(scope.row.goods_id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页功能 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="goods.pagenum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="goods.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </wrap>
  </div>
</template>

<script>
import Wrap from "components/Wrap";
import { formatDate } from "@/common/utils";
export default {
  components: {
    Wrap
  },
  data() {
    return {
      // 商品列表
      goodsList: [],
      //   商品查询对象
      goods: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      // 商品总数
      total: 0
    };
  },
  created() {
    this.getGoodsList();
  },
  filters: {
    showDate: function(value) {
      let date = new Date(value * 1000);
      return formatDate(date, "yyyy-MM-dd");
    }
  },
  methods: {
    //   商品列表数据请求
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.goods
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    // 页码切换大小变化
    handleSizeChange(newSize) {
      this.goods.pagesize = newSize;
      this.getGoodsList();
    },
    // 点击页码变化
    handleCurrentChange(newPage) {
      this.goods.pagenum = newPage;
      this.getGoodsList();
    },
    // 搜索
    search() {
      this.getGoodsList();
    },
    // 清空输入框后触发事件
    clearQuery() {
      this.getGoodsList();
    },
    // 删除商品
    async deleteGoods(id) {
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
      const { data: res } = await this.$http.delete("goods/" + id);
      console.log(res);

      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getGoodsList();
    },
    // 修改商品
    editGoods() {},
    // 添加商品
    goodsAdd() {
      this.$router.push('/goods/add')
    }
  }
};
</script>

<style>
</style>