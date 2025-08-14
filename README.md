# 飞书值日机器人 (多维表格版)

这是一个基于 Node.js 的飞书机器人脚本，用于自动化处理群组的值日安排和每日提醒。**此版本使用飞书多维表格作为数据存储。**

## 功能

- **每月自动生成值日表**: 每月1号凌晨1点，自动获取指定飞书群的成员列表，生成当月的值日排班表，并同步到指定的多维表格中。
- **每日定时提醒**: 每天上午9点，根据值日表，在群聊中 `@` 当天的值日人员，提醒其完成值日工作。

## 技术栈

- **运行时**: Node.js
- **飞书 SDK**: `@larksuiteoapi/node-sdk`
- **定时任务**: `node-schedule`
- **配置管理**: `dotenv`

## 项目结构

```
.
├── services/
│   └── schedule_service.js   # 生成排班表的业务逻辑
├── utils/
│   ├── feishu_helper.js      # 封装与飞书 API 交互的函数
│   └── lark_client.js        # 初始化飞书 SDK 客户端
├── .env                      # 存储敏感的凭证信息 (需手动创建)
├── .env.example              # .env 文件的模板
├── INSTRUCTIONS.md           # 详细的飞书应用配置指南 (多维表格版)
├── main.js                   # 主程序入口，负责调度定时任务
├── package.json
└── README.md
```

## 配置步骤

1.  **克隆或下载项目**
    ```bash
    git clone <your-repo-url>
    cd feishu-duty-robot
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置飞书应用和多维表格**
    - 详细步骤请严格参考项目中的 `INSTRUCTIONS.md` 文件。
    - 操作核心：创建飞书企业自建应用 -> 配置权限 -> 创建多维表格 -> 获取所有凭证。

4.  **创建 `.env` 文件**
    - 将 `.env.example` 复制一份并重命名为 `.env`。
    - 根据 `INSTRUCTIONS.md` 的指引，将获取到的 `APP_ID`, `APP_SECRET`, `CHAT_ID`, `BITABLE_APP_TOKEN`, 和 `BITABLE_TABLE_ID` 填入 `.env` 文件。

## 如何运行

### 1. 本地测试

完成配置后，您可以直接运行主程序来启动机器人。

```bash
node main.js
```

程序启动后会打印 "飞书值日机器人已启动 (多维表格版)..."，然后等待定时任务触发。

**为了立即测试功能**，您可以取消 `main.js` 文件末尾的两行注释：

```javascript
// main.js

// ... (前面的代码)

// 为了方便测试，我们可以在启动时立即执行一次
updateMonthlyDutyRoster();
sendDailyDutyNotification();
```

然后再次运行 `node main.js`，程序会立刻执行一次月度排班和每日提醒的逻辑。

### 2. 服务器部署 (推荐)

为了让机器人能够 7x24 小时稳定运行，建议将其部署在服务器上，并使用进程管理工具 `pm2` 来守护进程。

1.  **在服务器上安装 pm2**
    ```bash
    npm install pm2 -g
    ```

2.  **使用 pm2 启动应用**
    在您的项目根目录下，执行：
    ```bash
    pm2 start main.js --name feishu-duty-robot
    ```

3.  **常用 pm2 命令**
    - `pm2 list`: 查看所有正在运行的应用
    - `pm2 stop feishu-duty-robot`: 停止机器人
    - `pm2 restart feishu-duty-robot`: 重启机器人
    - `pm2 logs feishu-duty-robot`: 查看日志输出

## 注意事项

- 请确保填入 `.env` 的所有 ID 和 Token 都是准确无误的。
- 多维表格的权限需要设置为**可编辑**给您的机器人账号，否则写入会失败。
- 如果群成员发生变动，新的排班会在下一个月的1号自动更新。