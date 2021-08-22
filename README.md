# 简介
本项目为西同下赵氏家谱的前端部分。点击查看[西同下赵氏家谱说明]()

# 背景
受家族长辈委托，创建电子版家谱，要求是把现有的纸质家谱电子化即可。但考虑到纸质化的家谱有以下问题：
* 表结构不合理————如有的页已经单独加了列
* 数据不一致————如同一个人在父辈家庭和自己家庭信息不一致，缺失或冲突
* 结构不灵活————如大部分的“政治面貌”“担任职务”都是空的，难以修改
* 权限不合理————不应当把权限收在一个人身上，现在可行不代表将来可行。每个分支上都应该有管理员    

故决定将人员结构化，并以表格、树形结构等多种样式来展现家族关系

# 总览
项目总体分为`数据库`、`server`、`fe`三部分。本仓库存放fe代码。
* 考虑到结构化，必须要用到数据库，百度腾讯的sql服务器需要购买，百度的TableStorage API非常难用。综合对比下来，使用了LeanCloud的数据库。点击查看LeanCloud数据库的[REST API文档](https://leancloud.cn/docs/rest_api.html)
* 考虑到隐私性，数据不能放在前端，应当是前端发起鉴权后由server下发。server使用百度云的CFC云函数，目前仅做了简单的鉴权。LeanCloud的云函数需要独立域名
* 考虑到便利性，静态页面应当在国内托管，放弃github。百度效率云不支持静态页面托管，Coding据说被腾讯收购后静态托管挺贵，最终选择了gitee    

总之，在预算有限（免费）的情况下，这些功能也足够使用了

# 数据管理

## server侧

> 考虑到向leancloud请求数据所产生的费用，server请求一次后持有全量人员信息，这些内存占用并不会达到CFC云函数收费的标准

```flow
start=>start: 收到fetch请求
userValid=>condition: 用户信息是否合法
timestampValid=>condition: 用户缓存版本是否过期
userInvalid=>operation: 返回用户不合法
expired=>operation: 返回全量数据，并携带数据版本信息
unexpired=>operation: 返回缓存可用
end=>end: 响应结束

start->userValid
userValid(no)->userInvalid->end
userValid(yes)->timestampValid
timestampValid(no)->expired->end
timestampValid(yes)->unexpired->end
```

## fe侧

> 考虑到请求CFC云函数所产生的费用，fe侧缓存全量的人员信息，在页面刷新时，server仅在必要时返回全量数据

```flow
start=>start: 携带用户信息和本地缓存版本发起请求
response=>operation: 收到server响应
userValid=>condition: 用户信息是否合法
cacheValid=>condition: 缓存是否可用
update=>operation: 更新缓存
end=>end: 展示数据
start->response->userValid(no)->end
userValid(yes)->cacheValid(yes)->end
cacheValid(no)->update->end
```

# people数据结构

# 树形展示代际关系

# 表格展示家庭关系