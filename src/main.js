import chalk from "chalk";
import execa from "execa";
import Listr from "listr";
import { projectInstall } from "pkg-install";
import * as emoji from 'node-emoji'
import cliWelcome from "cli-welcome";

/**
 * clone a project
 * @param {*} options
 * @returns
 */
async function cloneTemplate(options) {
  // clone the template
  // if (process.cwd() + "/" + options.projectName) {
  //   console.log("project existe");
  //   throw new Error(chalk.red("a project with this name already exists"))
  // }
  const result = await execa(
    "git",
    ["clone", "--depth", "1", options.template, options.projectName],
    {
      cwd: options.targetDirectory,
    }
  );
  if (result.failed) {
    // return Promise.reject(new Error("Failed to initialize git"));
    // console.log({ temp: result });
    return chalk.red.bold("Oooooops! error ");
  }
  return;
}

/**
 *  supprimer l'historique de commit
 * @param {*} options
 * @returns
 */
async function removeGit(options) {
  const result = await execa("rm", ["-rf", ".git"], {
    cwd: options.targetDirectory + "/" + options.projectName,
  });
  if (result.failed) {
    // return Promise.reject(new Error("Failed to initialize git"));
    return chalk.red.bold("Oooooops! error ");
  }
  return;
}
/**
 *  initialize git repository
 * @param {*} options
 * @returns
 */
async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: options.targetDirectory + "/" + options.projectName,
  });
  if (result.failed) {
    // return Promise.reject(new Error("Failed to initialize git"));
    console.log({ git: result });
    return chalk.red.bold("Oooooops! error ");
  }
  return;
}

/**
 * Create project
 * @param {*} options
 * @returns boolean
 */
export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
  };

  /**
   * TODO: Verify if the projectName is already exists in this directory
   */

  /**
   * all actions we need to do here
   */
  const tasks = new Listr([
    {
      title: "Installing...",
      task: () => cloneTemplate(options),
    },
    {
      title: emoji.emojify('Wait for your :coffee:!'),
      task: () => removeGit(options),
      enabled: () => true,
    },
    {
      title: emoji.emojify('Almost done :smile:!'),
      task: () => initGit(options),
      enabled: () => true,
    },
    {
      title: "Install dependencies",
      task: () =>
        projectInstall({
          cwd: options.targetDirectory + "/" + options.projectName,
        }),
      skip: () =>
        !options.runInstall
          ? "Pass --install to automatically install dependencies"
          : undefined,
    },
  ]);

  /**
   * execute the list of tasks
   */
  await tasks.run();

  /**
   * Success information
   */
  cliWelcome({
    title: "rxd-create-app",
    tagLine: "RED Team by Bakeli",
    bgColor: `#FADC00`,
    color: `#000000`,
    bold: true,
    clear: true,
    version: "1.0.0",
    description: "Focus on essentials with rxd-cli"
  });
  console.log("\n%s Project ready \n", chalk.green.bold("DONE"));

  if (!options.runInstall) {
    console.log(chalk.white.bold("- Run"));
    console.log(
      chalk.white.bold("\n  - cd %s/"),
      chalk.white.bold(options.projectName)
    );
    // console.log(chalk.white.bold("  - npm run vendor"));
    console.log(chalk.white.bold("  - npm install \n"));
  } else {
    console.log(chalk.white.bold("- Run"));
    console.log(
      chalk.white.bold("\n  - cd %s"),
      chalk.white.bold(options.projectName)
    );
    console.log(chalk.white.bold("  - npm start \n"));
  }
  console.log(
    "%s %s",
    chalk.green.bold("--- REDTeam --- : "),
    chalk.green("(Recherche Education & Development)")
  );

  return true;
}
