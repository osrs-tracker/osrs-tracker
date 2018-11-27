import { Injectable } from '@angular/core';
import { Hiscore, Minigame, Skill } from './hiscore.model';

const SKILL_NAMES = [
  'Total', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting',
  'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving',
  'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction'
];
const CLUESCROLL_NAMES = ['All', 'Easy', 'Medium', 'Hard', 'Elite', 'Master'];
const BOUNTYHUNTER_NAMES = ['Hunter', 'Rogue'];

@Injectable({
  providedIn: 'root'
})
export class HiscoreUtilitiesProvider {

  parseHiscoreString(hiscore: string, date: Date): Hiscore {
    // 31st of octobre the order of the minigames changed
    if (date.getTime() < Date.UTC(2018, 9, 31)) {
      return this.preMinigameChange(hiscore);
    } else {
      return this.postMinigameChange(hiscore);
    }
  }

  private postMinigameChange(hiscore: string): Hiscore {
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
      return new Minigame(CLUESCROLL_NAMES[index], cols[0], cols[1]);
    });
    const lms = {
      rank: rows[32].split(',')[0],
      score: rows[32].split(',')[1],
    };

    return new Hiscore(null, null, null, null, skills, cluescrolls, bountyhunter, lms, hiscore);
  }

  private preMinigameChange(hiscore: string): Hiscore {
    const rows = hiscore.split('\n');
    const skills = rows.slice(0, 24).map((skill, index) => {
      const cols = skill.split(',');
      return new Skill(SKILL_NAMES[index], cols[0], cols[1], cols[2]);
    });
    const cluescrolls = [rows[26], rows[24], rows[25], rows[29], rows[31], rows[32]].map((cluescroll, index) => {
      const cols = cluescroll.split(',');
      return new Minigame(CLUESCROLL_NAMES[index], cols[0], cols[1]);
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
