import './style.css'
import girlNames from './girlnames.json'
import boyNames from './boynames.json';
import { GameState, Person } from './types';
// invent money/ banks
// get invaded, people taken, killed, maimed, 
// start with two foods: carrots, tea
// go on an expedition out of need for partner, for different kinds of food, for adventure, get new skills from different people, bring people back from other islands
// jobs
// childcare
// what needs does the island have e.g. childcare, food variation
let Debug = true;
const girlNamesLength = girlNames.names.length;
const boyNamesLength = boyNames.names.length;
function getRandomNumber(from: number, to: number) {
  return Math.floor(Math.random() * to) + from;
}

function getRandomBoyName() {
  const i = getRandomNumber(0, boyNamesLength - 1);
  return boyNames.names[i];
}
function getRandomGirlName() {
  const i = getRandomNumber(0, girlNamesLength - 1);
  return girlNames.names[i];
}

const State: GameState = {
  year: 0,
  food: 10000,
  people: [
    {
      id: 1,
      name: getRandomBoyName(),
      gender: 'male',
      age: 18,
      children: []
    },
    {
      id: 2,
      name: getRandomGirlName(),
      gender: 'female',
      age: 18,
      children: []
    }
  ],
  news: [],
  islandEvents: [],
  islandActions: []
};
State.people[0].partner = State.people[1];
State.people[1].partner = State.people[0];


function doPartnerMatching(state: GameState) {
  const partnerFindingChancePercentage = 40;
  const partnerFindingAgeMinimum = 14;
  const acceptablePartnerAgeGap = 30;

  const males = state.people.filter(p => p.gender == 'male' && !p.partner && p.age >= partnerFindingAgeMinimum);
  const females = state.people.filter(p => p.gender == 'female' && !p.partner && p.age >= partnerFindingAgeMinimum);
  const shouldLoopOverMales = males > females;
  const genderToLoopOver = shouldLoopOverMales ? males : females;
  const candidates = shouldLoopOverMales ? females : males;
  for (let i = 0; i < genderToLoopOver.length; i++) {
    const rand = getRandomNumber(0, 100);
    if (rand <= partnerFindingChancePercentage) {
      if (candidates.length) {
        const index = getRandomNumber(0, candidates.length - 1);
        if (!candidates[index].partner) {
          genderToLoopOver[i].partner = candidates[index];
          candidates[index].partner = genderToLoopOver[i];
        }
      }
    }
  }
}

function doDeath(state: GameState): Person[] {
  const result: Person[] = [];
  for (let i = 0; i < state.people.length; i++) {
    const p = state.people[i];
    if (p.age < 14) {
      continue;
    }
    const upperLimit = p.age < 120 ? 200 : 130;
    const died = getRandomNumber(0, upperLimit - p.age) < 1;
    if (died) {
      p.partner = undefined;
      result.push(p);
      p.dead = true;
      // delete state.people[i];
    }

  }
  return result;
}

function makeBabies(state: GameState) {
  const peopleLength = state.people.length;
  const babies: Person[] = [];
  for (let i = 0; i < peopleLength; i++) {
    const p = state.people[i];
    if (p.gender == 'female') {
      const withinChildbearingAge = p.age > 14 && p.age < 50;

      const percentageChanceToMakeBaby = 30;

      if (withinChildbearingAge && p.partner) {
        // const partner = state.people.find(x => x.id == p.partner);
        // if (partner?.gender == 'male' && !partner.dead && partner?.age >= 14) {
        const rand = getRandomNumber(0, 100);
        if (rand <= percentageChanceToMakeBaby) {
          // make a baby
          const gender: 'male' | 'female' = getRandomNumber(0, 100) >= 50 ? 'male' : 'female';
          const name = gender == 'male' ? getRandomBoyName() : getRandomGirlName()
          babies.push({
            id: state.people.length + babies.length + 1,
            name,
            age: 0,
            gender,
            children: [],
            mother: p.id,
            father: p.partner.id
          });
        }
        // }
      }
    }
  }
  state.people.push(...babies);
}

function next(state: GameState, skipRender = false) {
  state.year++;
  state.news = [];
  const now = performance.now();
  state.people
    .forEach(p => {
      p.age++;
      state.food--;
    });
  const afterLoopingPeople = performance.now();
  if (Debug) {
    console.log(`Aging people: ${afterLoopingPeople - now} ms`);
  }

  doPartnerMatching(state);
  const afterPartnerMatching = performance.now();
  if (Debug) {
    console.log(`Partner matching: ${afterPartnerMatching - afterLoopingPeople}ms`);
  }
  makeBabies(state);
  const afterBabies = performance.now();
  if (Debug) {
    console.log(`Making babies: ${afterBabies - afterPartnerMatching}ms`);
  }
  const deceased: Person[] = doDeath(state);
  if (deceased.length) {
    state.news.push({
      title: 'Deaths',
      body: `${deceased.map(p => `${p.name}, aged ${p.age}`)}`
    });
    // deceased.forEach(dp => {
    //   state.people = state.people.filter(x => x.id !== dp.id);
    // });
    state.people = state.people.filter(p => !p.dead);
  }
  const afterDeath = performance.now();
  if (Debug) {
    console.log(`death: ${afterDeath - afterBabies}ms`);
  }
  if (!skipRender) {
    renderApp();
  }
}

function bulkYearsNext(years: number) {
  for (let i = 0; i < years; i++) {
    next(State, true);
  }
  renderApp();
}

function renderNextButton(parent: HTMLDivElement) {
  const container = document.createElement('div');
  const yearsToSkip = 25;

  const nextButton: HTMLButtonElement = document.createElement('button');
  nextButton.innerHTML = 'Next';
  container.addEventListener('click', () => next(State))
  container.appendChild(nextButton);

  const secondButton: HTMLButtonElement = document.createElement('button');
  secondButton.innerHTML = `Next ${yearsToSkip} years`;
  secondButton.addEventListener('click', () => bulkYearsNext(yearsToSkip));
  container.appendChild(secondButton);

  parent.appendChild(container);
}

function logGameState(parent: HTMLDivElement) {
  const el: HTMLDivElement = document.createElement('div');
  const news = State.news.length ? `
  <h3>News</h3>
  ${State.news.map(n => `<div><h5>${n.title}</h5><p>${n.body}</p></div>`)}
  ` : ``;
//  ${State.people.map(p => {
//     return `<div>${p.name} ${p.gender}, ${p.age}</div>`
//   }).join('')}

// ${news}
  const template = `
  <h1>Year ${State.year}</h1>
  <h3>People (${State.people.length})</h3>
   <p>Food reserves: ${State.food}</p>

    `;
  el.innerHTML = template;
  parent.appendChild(el);
}

const app = document.querySelector<HTMLDivElement>('#app')!

function renderApp() {
  const now = performance.now();
  app.innerHTML = '';
  renderNextButton(app);
  logGameState(app);
  const after = performance.now();
  if (Debug) {
    console.log(`render: ${after - now}ms`);
  }
}

renderApp();
