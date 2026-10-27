# 稳稳练 · 居家力量与平衡训练

适合手机和电脑查看的中文训练网页，包括7个力量动作、2个平衡动作、4周进阶安排、动作示意、每日分组打卡和60/90秒休息计时。

## 本地运行

这是无需构建、没有第三方前端依赖的静态站点。安装 Python 3 后，在仓库目录运行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

访问 http://127.0.0.1:4173 。由于使用 JavaScript modules，请通过 HTTP 服务访问，不能直接双击 HTML。

## 验证

Node.js 16或更新版本：

```sh
npm test
```

## GitHub Pages

仓库的 Settings → Pages 中选择 Deploy from a branch，分支选择 `main`，目录选择 `/ (root)`。发布地址：

https://roisoleil520.github.io/steady-home-training/

站点使用相对路径，兼容 GitHub Pages 的仓库子目录。`.nojekyll` 表示直接发布静态文件。无需依赖安装或构建。

## 文件

- `index.html`：页面结构与训练须知。
- `styles.css`：手机、平板、电脑与打印样式，支持减少动态效果设置。
- `training.js`：训练数据、组数规则与存储数据校验。
- `diagrams.js`：原创SVG动作要点示意。
- `app.js`：筛选、阶段选择、本地打卡、计时与日期切换。
- `assets/training-sheet.pdf`：单页图解训练表。
- `tests/training.test.js`：训练进度和记录规则测试。

## 记录与计时

每日记录以本地日期保存在当前浏览器的 localStorage，不上传，不跨设备同步。存储不可用时显示提示，本次会话仍可打卡。午夜后返回页面会切换到新一天；多个标签页之间同步本地记录。训练阶段由使用者手动选择，不根据日期自动增加训练量。第二周起，标注1～2组的动作完成第1组即可计为完成，第2组为可选。

计时使用截止时间计算，避免后台标签页计时变慢；暂停、恢复、重置和60/90秒切换均可用。计时结束不会自动开始下一组。

## 使用范围

计划适用于医生已允许踝部正常负重，且没有椎体压缩骨折或近期不明原因腰背痛的人群。骨质疏松程度和具体负重限制需由骨科或康复师评估。第1周每个力量动作仅1组；后续增加训练量取决于当日与次日身体反应。

参考：[NHS家庭力量练习](https://www.nhs.uk/live-well/exercise/strength-exercises/)、[BHOF骨质疏松与安全运动](https://www.bonehealthandosteoporosis.org/patients/treatment/exercisesafe-movement/)。
