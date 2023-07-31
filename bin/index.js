#! /usr/bin/env node

const path = require("path");
const program = require("commander");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const downloadGitRepo = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");
const figlet = require("figlet");
const package = require("../package.json");
const templates = require("./templates");

// console.log("rwb-cli~~~~");

program.version(`v${package.version}`);

program.on("--help", () => {
  console.log(
    "\r\n" +
      figlet.textSync("RWB", {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      })
  );
  console.log(
    `\r\nRun ${chalk.cyan(`rwb-cli <command> --help`)} show details\r\n`
  );
});

program
  .command("create [projectName]")
  .option("-t, --template <template>", "模板名称")
  .description("创建模板")
  .action(async (projectName, option) => {
    console.log(option);
    const { template } = option;

    if (!projectName) {
      const { name } = await inquirer.prompt({
        type: "input",
        name: "name",
        message: "请输入项目名称：",
        default: "my-project",
        validate: (val) => {
          if (/\s/.test(val)) {
            return "项目名称请勿包含空格";
          }
          return true;
        },
      });
      projectName = name;
    }

    console.log("项目名称：" + projectName);

    let projectTemplate = template;
    if (!projectTemplate) {
      const { template } = await inquirer.prompt({
        type: "list",
        name: "template",
        message: "请选择模板：",
        choices: templates,
      });
      projectTemplate = template;
    }

    console.log("模板：" + projectTemplate);

    const dest = path.join(process.cwd(), projectName);

    if (fs.existsSync(dest)) {
      const { force } = await inquirer.prompt({
        type: "confirm",
        name: "force",
        message: "该文件夹已存在，是否覆盖？",
      });
      if (force) {
        fs.removeSync(dest);
      } else {
        process.exit(1);
      }
    }

    const loading = ora("正在下载模板");
    loading.start();
    downloadGitRepo(projectTemplate, dest, (err) => {
      if (err) {
        loading.fail("创建模板失败", err);
      } else {
        loading.succeed("创建模板成功");
      }
    });
  });

program.parse(process.argv);
