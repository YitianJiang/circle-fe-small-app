# 规范

1.缩进 4个空格

2.尽量使用绝对路径，js文件获取不到根路径，就使用相对路径

3.在调用系统api时，比如tt.request ，success、fail、complete 统一使用lamda, 因为使用lamda能够获取到this，不使用lamda获取到的this为undefined，如果使用that,又显得冗余。

# 效果



