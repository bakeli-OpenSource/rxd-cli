import arg from "arg";
import chalk from "chalk";
import inquirer from "inquirer";
import _ from "lodash"
import { createProject } from "./main.js";

const ERROR = chalk.red

/* @Template file */
import { templates } from "../templates.js";
// console.log(templates)

/**
 * !Cette fonction permet de recuperer les tous les parametres
 * qui viennent apres la commande "rxd-create-project"
 * Ensuite il fait correspondre les flags telsque -g, -i
 * Si un flag supplemetaire est ajoute(par exemple "-c") cela va retourner une erreur
 * 
 * La fonction retourne un objet {git, template, projectName, runInstall}
 * - git: pour initialiser .git
 * - template: pour choisir le projet a creer
 * - projectName: contient le nom du projet a creer
 * - runInstall: pour faire "npm install"
 * @param {*} rawArgs
 * @returns object
 */
function getAndMatchInputArgsOptions(rawArgs) {
  const args = arg(
    {
      "--git": Boolean,
      "--install": Boolean,
      "-g": "--git",
      "-i": "--install",
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    git: args["--git"] || false,
    template: null,
    projectName: args._[0],
    runInstall: args["--install"] || false,
  };
}

/**
 * Cette fonction permet de remplir l'objet {git, template, projectName, runInstall}
 * au cas ou on run la commande "rxd-create-project" sans preciser le nom du project
 * ou bien les obtions (-g, -i)
 * @param {*} options
 * @returns object
 */
async function promptNoneGivenArgs(options) {
  // all questions
  const promptQuestions = [];
  const technoChoicePrompt = [];
  const projectToChoosePrompt = []
  let templateChoiceAnswers = []

  if (!options.projectName) {
    promptQuestions.push({
      type: "input",
      name: "projectName",
      message: "Enter project name: ",
      default: "rxd-app"
    });
  }
  // if (!options.git) {
  //   promptQuestions.push({
  //     type: "confirm",
  //     name: "git",
  //     message: "Initialize a git repository?",
  //     default: false,
  //   });
  // }

  // Template langue Choice

  // ! asupprimer
  templateChoiceAnswers = await inquirer.prompt(promptQuestions);

  technoChoicePrompt.push({
    type: "list",
    name: "techno",
    message: "Please choose your tech",
    choices: templates.map((template) => template.langue),
  });
  const technoChoiceAnswers = await inquirer.prompt(technoChoicePrompt)
  console.log({ technoChoiceAnswers });
  projectToChoosePrompt.push({
    type: "list",
    name: "project",
    message: "Please choose which project template to use",
    choices: templates
      .find(
        (template) => template.langue === technoChoiceAnswers.techno
      )
      .repos.map((repo) => repo.name),
  });
  const projectChoiceAnswer = await inquirer.prompt(projectToChoosePrompt)
  // console.log({ templateChoiceAnswers, technoChoiceAnswers })
  let findTemplate = templates.filter(
    (template) => template.langue === technoChoiceAnswers.techno
  )[0].repos
    .find(repo => repo.name === projectChoiceAnswer.project);
  // console.log({ projectChoiceAnswer, findTemplate });

  // const answers = await inquirer.prompt(templateChoiceAnswers);
  // console.log({ answers })

  return {
    ...options,
    projectName: options.projectName
      ? options.projectName
      : templateChoiceAnswers.projectName,
    // template: "https://gitlab.com/Hackbou/react-api-controller.git",
    template: findTemplate.url,
    git: options.git || templateChoiceAnswers.git,
  };
}

/**
 * this function will create a new project
 * @param {*} args
 */
export async function cli(args) {
  let options = getAndMatchInputArgsOptions(args);
  options = await promptNoneGivenArgs(options);

  await createProject(options);
}
