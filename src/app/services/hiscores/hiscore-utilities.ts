import { Injectable } from '@angular/core';
import { Hiscore, Minigame, Skill } from './hiscore.model';

const SKILL_NAMES = [
  'Total',
  'Attack',
  'Defence',
  'Strength',
  'Hitpoints',
  'Ranged',
  'Prayer',
  'Magic',
  'Cooking',
  'Woodcutting',
  'Fletching',
  'Fishing',
  'Firemaking',
  'Crafting',
  'Smithing',
  'Mining',
  'Herblore',
  'Agility',
  'Thieving',
  'Slayer',
  'Farming',
  'Runecrafting',
  'Hunter',
  'Construction',
];
const PRE_BEGINNER_CLUESCROLL_NAMES = ['All', 'Easy', 'Medium', 'Hard', 'Elite', 'Master'];
const CLUESCROLL_NAMES = ['All', 'Beginner', 'Easy', 'Medium', 'Hard', 'Elite', 'Master'];
const BOUNTYHUNTER_NAMES = ['Hunter', 'Rogue'];

@Injectable({
  providedIn: 'root',
})
export class HiscoreUtilitiesProvider {
  parseHiscoreString(hiscore: string, date: Date): Hiscore {
    if (date.getTime() < Date.UTC(2018, 9, 31)) {
      return this.preOctobre2018MinigameChange(hiscore);
    } else if (date.getTime() <= Date.UTC(2019, 3, 11)) {
      return this.postOctobre2018Change(hiscore);
    } else {
      return this.postApril2019Change(hiscore);
    }
  }

  private postApril2019Change(hiscore: string): Hiscore {
    const rows = hiscore.split('\n');
    const skills = rows.slice(0, 24).map((skill, index) => {
      const cols = skill.split(',');
      return new Skill(SKILL_NAMES[index], cols[0], cols[1], cols[2]);
    });
    const bountyhunter = [rows[24], rows[25]].map((cluescroll, index) => {
      const cols = cluescroll.split(',');
      return new Minigame(`Bounties - ${BOUNTYHUNTER_NAMES[index]}`, cols[0], cols[1]);
    });
    const lms = {
      rank: rows[26].split(',')[0],
      score: rows[26].split(',')[1],
    };
    const cluescrolls = [rows[27], rows[28], rows[29], rows[30], rows[31], rows[32], rows[33]].map(
      (cluescroll, index) => {
        const cols = cluescroll.split(',');
        return new Minigame(CLUESCROLL_NAMES[index], cols[0], cols[1]);
      }
    );

    return new Hiscore(null, null, null, null, skills, cluescrolls, bountyhunter, lms, hiscore);
  }

  private postOctobre2018Change(hiscore: string): Hiscore {
    const rows = hiscore.split('\n');
    const skills = rows.slice(0, 24).map((skill, index) => {
      const cols = skill.split(',');
      return new Skill(SKILL_NAMES[index], cols[0], cols[1], cols[2]);
    });
    const bountyhunter = [rows[24], rows[25]].map((cluescroll, index) => {
      const cols = cluescroll.split(',');
      return new Minigame(`Bounties - ${BOUNTYHUNTER_NAMES[index]}`, cols[0], cols[1]);
    });
    const cluescrolls = [rows[26], rows[27], rows[28], rows[29], rows[30], rows[31]].map((cluescroll, index) => {
      const cols = cluescroll.split(',');
      return new Minigame(PRE_BEGINNER_CLUESCROLL_NAMES[index], cols[0], cols[1]);
    });
    const lms = {
      rank: rows[32].split(',')[0],
      score: rows[32].split(',')[1],
    };

    return new Hiscore(null, null, null, null, skills, cluescrolls, bountyhunter, lms, hiscore);
  }

  private preOctobre2018MinigameChange(hiscore: string): Hiscore {
    const rows = hiscore.split('\n');
    const skills = rows.slice(0, 24).map((skill, index) => {
      const cols = skill.split(',');
      return new Skill(SKILL_NAMES[index], cols[0], cols[1], cols[2]);
    });
    const cluescrolls = [rows[26], rows[24], rows[25], rows[29], rows[31], rows[32]].map((cluescroll, index) => {
      const cols = cluescroll.split(',');
      return new Minigame(PRE_BEGINNER_CLUESCROLL_NAMES[index], cols[0], cols[1]);
    });
    const bountyhunter = [rows[28], rows[27]].map((cluescroll, index) => {
      const cols = cluescroll.split(',');
      return new Minigame(`Bounties - ${BOUNTYHUNTER_NAMES[index]}`, cols[0], cols[1]);
    });
    const lms = {
      rank: rows[30].split(',')[0],
      score: rows[30].split(',')[1],
    };

    return new Hiscore(null, null, null, null, skills, cluescrolls, bountyhunter, lms, hiscore);
  }
}
