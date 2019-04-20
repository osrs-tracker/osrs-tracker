import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'skill-icon',
  templateUrl: 'skill-icon.component.html',
  styleUrls: ['./skill-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillIconComponent implements OnInit {
  private static readonly SKILL_NAMES = [
    'total',
    'attack',
    'defence',
    'strength',
    'hitpoints',
    'ranged',
    'prayer',
    'magic',
    'cooking',
    'woodcutting',
    'fletching',
    'fishing',
    'firemaking',
    'crafting',
    'smithing',
    'mining',
    'herblore',
    'agility',
    'thieving',
    'slayer',
    'farming',
    'runecrafting',
    'hunter',
    'construction',
  ];

  @Input() skill: string;
  @Input() height: string;
  src: string;

  ngOnInit() {
    this.src = `./assets/imgs/skills/${SkillIconComponent.SKILL_NAMES.indexOf(this.skill.toLocaleLowerCase()) + 1}.gif`;
  }
}
