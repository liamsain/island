import './style.css'
import girlNames from './girlnames.json'
import boyNames from './boynames.json';
// invent money/ banks
// get invaded, people taken, killed, maimed, 
// start with two foods: carrots, tea
// go on an expedition out of need for partner, for different kinds of food, for adventure, get new skills from different people, bring people back from other islands
// jobs
// childcare
// what needs does the island have e.g. childcare, food variation
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


interface Person {
  id: number
  name: string
  age: number
  partner?: number
  gender: 'male' | 'female'
  children: Person[]
  mother?: number
  father?: number
  dead?: boolean
}
interface News {
  title: string
  body: string
}
interface IslandAction {
  title: string
  description: string
  
}
interface GameState {
  year: number
  people: Person[]
  food: number
  news: News[]
  islandEvents: IslandEvent[]
  islandActions: IslandAction[]
}
interface IslandEvent {
  title: string
  description: string
  choices: string[]
}

const gameState: GameState = {
  year: 0,
  food: 10000,
  people: [
    {
      id: 1,
      name: getRandomBoyName(),
      gender: 'male',
      age: 18,
      partner: 2,
      children: []
    },
    {
      id: 2,
      name: getRandomGirlName(),
      gender: 'female',
      age: 18,
      partner: 1,
      children: []
    }
  ],
  news: [],
  islandEvents: [],
  islandActions: []
};

function next(state: GameState) {
  state.year++;
  state.news = [];
  const deceased: Person[] = [];
  state.people.forEach(p => {
    p.age++;
    state.food--;
    if (p.gender == 'female' && !p.dead) {
      const withinChildbearingAge = p.age > 14 && p.age < 45;
      if (withinChildbearingAge && p.partner) {
        const partner = state.people.find(x => x.id == p.partner);
        if (partner?.gender == 'male' && !partner.dead && partner?.age >= 14) {
          const rand = getRandomNumber(0, 100);
          if (rand < 20) {
            const gender: 'male' | 'female' = getRandomNumber(0, 100) > 50 ? 'male' : 'female';
            const name = gender == 'male' ? getRandomBoyName() : getRandomGirlName()
            state.people.push({
              id: state.people.length + 1,
              name,
              age: 0,
              gender,
              children: [],
              mother: p.id,
              father: partner.id
            });
          }
        }
      }
    }
    const died = getRandomNumber(0, 200 - p.age) < 2;
    if (died) {
      deceased.push(p);
      p.dead = true;
    }
  });
  if (deceased.length) {
    state.news.push({
      title: 'Deaths',
      body: `${deceased.map(p => `${p.name}, aged ${p.age}`)}`
    });
    deceased.forEach(dp => {
      state.people = state.people.filter(x => x.id !== dp.id);
    });
  }
  renderApp();
}

function renderNextButton(parent: HTMLDivElement) {
  const el: HTMLButtonElement = document.createElement('button');
  el.innerHTML = 'Next';
  el.addEventListener('click', () => next(gameState))
  parent.appendChild(el);
}

function logGameState(parent: HTMLDivElement) {
  const el: HTMLDivElement = document.createElement('div');
  const news = gameState.news.length ? `
  <h3>News</h3>
  ${gameState.news.map(n => `<div><h5>${n.title}</h5><p>${n.body}</p></div>`)}
  ` : ``;

  const template = `
  <h1>Year ${gameState.year}</h1>
  <h3>People</h3>
  ${gameState.people.map(p => {
    return `<div>${p.name} ${p.gender}, ${p.age}</div>`
  }).join('')}
  <p>Food reserves: ${gameState.food}</p>
  ${news}
  `;
  el.innerHTML = template;
  parent.appendChild(el);
}

const app = document.querySelector<HTMLDivElement>('#app')!

function renderApp() {
  app.innerHTML = '';
  renderNextButton(app);
  logGameState(app);
}

renderApp();
