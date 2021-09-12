# circle的前端小程序(头条小程序)

## 规范

1.缩进 4个空格

2.尽量使用绝对路径，js文件获取不到根路径，就使用相对路径

3.在调用系统api时，比如tt.request ，success、fail、complete 统一使用lamda, 因为使用lamda能够获取到this，不使用lamda获取到的this为undefined，如果使用that,又显得冗余。

## 产品定位：

　　最开始是想做成朋友圈的样式，但是后来给评论，点赞头像列表做分页，发现越来越像微博。　

　　但朋友圈和微博有巨大的不同：

　　朋友圈的评论从上往下，**从旧到新**，新发表的评论放在最后显示，所以朋友圈发布评论的时候，页面会滚动到最后一条评论处，这样点发布评论后刚好就能看到自己刚刚发布的评论。这也就导致朋友圈首次加载就必须加载所有的评论，不需要给评论做分页。

　　微博从上往下，**从新到旧**，微博给人刷存在感，最新发布的评论显示在最上面，所以微博不需要往下滚动，因为发布评论后能够直接看到自己的评论在最上面，微博用户很多，评论就必须分页显示。

　　所以，这个小程序前端，就有了两个版本，v1版本首页像朋友圈，但是个人详情页又有关注的人、收藏的文章，<span style="color: red;">所以v1版本的产品定位出现了问题，做成了个**四不像**，</span>，首页像朋友圈，个人详情页又只有微博、头条这类产品才有，然后就变成了v2。

　　关于v1和v2：

　　这些社交产品分为两类：

　　第一类：

　　1.1 微博 、头条：快消品，头条收藏入口做的隐晦，微博收藏入口做的更隐晦。

　　1.2 知乎：精品，收藏按钮就在右下角。

　　第二类：

　　朋友圈：没有关注，也没收收藏，发布的评论显示在评论列表最后，发布评论时需要滚动屏幕到最后一条评论，这样好看到自己刚刚发布的评论，评论不做分页。

　　考虑到要做关注和收藏，所以v2版本准备做成第一类。

## 效果

##### 扫码：（个人主体 点评推荐类目 在字节上线不了 但是还是可以用 抖音、今日头条扫码）

<img src="https://github.com/YitianJiang/image-resource/blob/master/circle%E4%BA%8C%E7%BB%B4%E7%A0%81.png"  style="width:200px;" />

##### 测试账号： 

　　用户名：张三

　　密码：123456

##### 目录：

[首页](######首页:)

[注册](######注册:)

[登录](######登录:)

[未登录点赞](######未登录点赞:)

[已登录点赞](######已登录点赞:)

[未登录评论](######未登录评论:)

[已登录，发布、删除评论](######已登录，发布、删除评论:)

[发布文章-带图片](######发布文章-带图片)

[发布文章-带视频](######发布文章-带视频)

[发布文章-仅文字](######发布文章-仅文字)

[个人详情页](######个人详情页)

[修改个人信息](######修改个人信息)

[我的关注](######我的关注)

[我发表的文章](######我发表的文章)

[我点赞的文章](######我点赞的文章)

[我收藏的文章](######我收藏的文章)

[我发布的评论](######我发布的评论)

[批量删除我发布的评论](######批量删除我发布的评论)

[搜索](######搜索)

[登出](######登出)



###### 首页:

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E9%A6%96%E9%A1%B5.gif"  style="width:400px;" />

###### 注册:

<img src="https://github.com/YitianJiang/image-resource/blob/master/people-I-follow.gif"  style="width:400px;" />

###### 登录：

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E7%99%BB%E5%BD%95.gif"  style="width:400px;" />                     

###### 未登录点赞：

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E7%82%B9%E8%B5%9E-%E6%9C%AA%E7%99%BB%E5%BD%95.gif"  style="width:400px;" />

###### 已登录点赞：

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E7%82%B9%E8%B5%9E-%E5%B7%B2%E7%99%BB%E5%BD%95.gif"  style="width:400px;" />

###### 未登录评论:

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E7%82%B9%E8%B5%9E-%E6%9C%AA%E7%99%BB%E5%BD%95.gif"  style="width:400px;" />

###### 已登录，发布、删除评论:

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E5%8F%91%E5%B8%83%E8%AF%84%E8%AE%BA-%E5%B7%B2%E7%99%BB%E5%BD%95.gif"  style="width:400px;" />

###### 发布文章-带图片

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E5%8F%91%E5%B8%83%E6%96%87%E7%AB%A0-%E5%B8%A6%E5%9B%BE%E7%89%87.gif"  style="width:400px;" />

###### 发布文章-带视频

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E5%8F%91%E5%B8%83%E6%96%87%E7%AB%A0-%E5%B8%A6%E8%A7%86%E9%A2%91.gif"  style="width:400px;" />

###### 发布文章-仅文字

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E5%8F%91%E8%A1%A8%E7%BA%AF%E6%96%87%E5%AD%97.gif"  style="width:300px;" />

###### 个人详情页                          

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E4%B8%AA%E4%BA%BA%E8%AF%A6%E6%83%85%E9%A1%B5.gif"  style="width:300px;" />

###### 修改个人信息

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E4%BF%AE%E6%94%B9%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF.gif"  style="width:300px;" />

###### 我的关注

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E6%88%91%E7%9A%84%E5%85%B3%E6%B3%A8.gif"  style="width:300px;" />

###### 我发表的文章 

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E6%88%91%E7%9A%84%E6%96%87%E7%AB%A0.gif"  style="width:300px;" />

###### 我点赞的文章

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E6%88%91%E7%9A%84%E7%82%B9%E8%B5%9E.gif"  style="width:300px;" />

###### 我收藏的文章

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E6%88%91%E7%9A%84%E6%94%B6%E8%97%8F.gif"  style="width:300px;" />

######  我发布的评论

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E6%88%91%E7%9A%84%E8%AF%84%E8%AE%BA.gif"  style="width:300px;" />

######  批量删除我发布的评论

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E6%89%B9%E9%87%8F%E5%88%A0%E9%99%A4%E8%AF%84%E8%AE%BA.gif"  style="width:300px;" />

######  搜索

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E6%90%9C%E7%B4%A2.gif"  style="width:300px;" />

######  登出

<img src="https://github.com/YitianJiang/image-resource/blob/master/%E9%80%80%E5%87%BA%E7%99%BB%E5%BD%95.gif"  style="width:300px;" />

## 使用到的技术

| 技术        | 说明               | 官网                                     |
| :---------- | ------------------ | ---------------------------------------- |
| wxMiniStore | 状态管理           | https://github.com/xiaoyao96/wxMiniStore |
| npm         | 包管理             |                                          |
| less        | 样式管理(部分使用) |                                          |