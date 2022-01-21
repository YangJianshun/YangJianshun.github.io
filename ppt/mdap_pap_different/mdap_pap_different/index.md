---
class: 'text-center'
---

# PAP 和 MDAP 平台的差异

---
layout: 'center'
---

# MDAP 是未来公司级别的性能监控平台


- **MDAP**: Multi-Dimension Analysis Platform (多维分析平台)
  <img src="/mdap_pap_different/images/mdap面包屑.png"/>
- **PAP**: Performance Analysis Platform (性能分析平台)
  <img src="/mdap_pap_different/images/pap面包屑.png"/>

<style>
  h1 {
    text-align: center;
    margin-bottom: 80px !important;
  }
  img,ul {
    margin: 20px auto;
    width: 600px;
  }
</style>

--- 
layout: 'center'
---

# 系统性能指标

|              | PAP    | MDAP                                                         |
| ------------ | ------ | ------------------------------------------------------------ |
| JS 错误      | **不支持** | 支持自动上报和自定义上报，<br/>自动上传 source map 仅支持 webpack |
| 上报长时任务* | 支持   | **不支持**                                                       |
| 静态资源     | 支持   | 支持，支持聚合URL                                            |
| API          | 支持   | 支持，支持聚合URL，支持逻辑成功率上报                        |


<p class="anno">
  *长时任务：任何连续不间断的且主UI线程繁忙50毫秒及以上的时间区间。
</p>

<style>
  h1 {
    text-align: center;
    margin-bottom: 80px !important;
  }
  .anno {
    margin-top: 50px;
  }
  td {
    font-size: 12px !important;
    line-height: 20px;
  }
</style>

---
class: 'text-center'
---

# 聚合URL

  <div class="container">
    <img src="/mdap_pap_different/images/url-pattern.png"/>
    <div class="right-container">
      <img src="/mdap_pap_different/images/聚合URL.png"/>
      <img src="/mdap_pap_different/images/原始URL.png"/>
    </div>
  </div>

  To make statistics more accurate based on enormous data which are discrete and irregular, MDAP needs to normalize the URLs. 
  
  url智能聚合，降低定位api或者静态资源散列问题定位的痛点

<style>
  h1 {
    text-align: center;
    margin-bottom: 20px !important;
  }
  .container {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin: 20px auto;
    /* border: 1px solid red; */
    align-items: center;
  }
  .container img {
    width: 400px;
    
  }
  .container .right-container {
    height: 320px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .container .right-container img {
    width: 460px;
  }
  
</style>


---
class: 'text-center'
clicks: 1
---

# API 逻辑成功率

<div class="container">

请求返回 HTTP status 为200， 但返回体中包含请求业务状态码， 用于判断此次请求是否逻辑上执行成功

<div class="left-container">
```json {all|3}
{
  "msg": "You don't have this permission",
  "ret": 10014,
  "timestamp": 1642302558695,
  "data": {}
}
```
<p v-click="1" class="anno">API 请求成功，逻辑上不成功</p>
</div>
</div>

<style>
  h1 {
    text-align: center;
    margin-bottom: 100px !important;
  }
  .container {
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
  }
  pre {
    /* width: 500px; */
    /* margin: 0 auto !important; */
    margin-left: 100px !important;
  }
  .anno {
    font-size: smaller;
  }
  .left-container {
    display: flex;
    flex-direction: column;
  }
</style>

---

# 自定义业务上报点
- PAP 支持 测速点、合成测速点
- MDAP 支持 性能点、合成性能点和**累积点**

<img src="/mdap_pap_different/images/累积点.png"/>

<style>
  h1 {
    text-align: center;
    margin-bottom: 50px !important;
  }
  ul {
    width: 400px;
    margin: 0 auto;
  }
  img {
    width: 400px;
    margin: 50px auto;
  }
</style>

---

# 对于每个性能点：

|            | **PAP**                                                          | **MDAP**                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 测速点筛选 | 支持自定义类目 (限制最多8项)<br/> 可以在初始化的时候定义，也可在上报的时候，<br/> 可以在平台上看到自定义类目，比较方便 | 支持业务测上报自定义数据，更加灵活。<br/>可在平台上通过 key - value 筛选上报记录。 |
| 耗时趋势   | 可以看耗时和上报数量的统计图                                 | 可以看耗时和上报数量的统计图                                 |
| 数据分布   | 支持展示自定义类目                                           | 展示的类目较少                                               |
| P指标      | 支持                                                         | 支持                                                         |
| 用户地区   | 支持                                                         | 支持                                                         |
| 环比数据   | 支持                                                         | 支持                                                         |
| 告警       | 支持                                                         | 告警配置页面还没上线                                         |

<style>
  td {
    font-size: 12px !important;
    line-height: 20px;
  }
</style>

---

# 性能点筛选

<div class="pap-container">
  <img class="pap-filter" src="/mdap_pap_different/images/pap筛选.png"/>
  <img class="pap-customer-category" src="/mdap_pap_different/images/pap类目名称设置.png"/>
</div>

- PAP 操作上更为方便

<img class="mdap-filter" src="/mdap_pap_different/images/mdap筛选.png">

- MDAP 更灵活
- 操作上的便捷性有待提高

<style>
  h1 {
    text-align: center;
    margin-bottom: 50px !important;
  }
  .pap-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .pap-filter {
    width: 60%;
  }
  .mdap-filter {
    margin-top: 30px;
  }
  .pap-customer-category {
    width: 30%;
    height: 150px;
    object-fit: cover;
    object-position: 0 0;
  }
</style>

---

# 其它


- MDAP 为 页面加载 耗时（dom_interactive - redirect_end）单独开了一个选项卡，<br/>而 PAP 在 项目概览中可以看到相关的系统测速点。
- PAP 支持查看测速点原始流水（包括系统性能点和自定义性能点点原始上报记录）
- MDAP 和 PAP 均支持邮件发送报告
- MDAP 支持添加多个自定义面板
- PAP 支持按环境（test/uat/live）筛选，MDAP 不支持
  - 需要在平台上分环境创建多个项目
  - 相同的性能点也需要在多个项目中重复创建


<style>
  h1 {
    text-align: center;
    margin-bottom: 80px !important;
  }
  ul {
    width: 680px;
    margin: 0 auto;
  }
  </style>
    
---

# 总结

- MDAP 包含性能监控和错误上报的能力，<br/>未来可能代替 sentry，将多种监控集中在一个平台上
- 相对于 PAP，有更丰富的监控指标，比如自定义累积点
- MDAP 支持API 逻辑成功率上报
- MDAP 支持 URL 聚类
- MDAP 支持自定义面板

<style>
h1 {
  text-align: center;
  margin-bottom: 100px !important;
}
ul {
  width: 450px;
  margin: 0 auto;
}
</style>