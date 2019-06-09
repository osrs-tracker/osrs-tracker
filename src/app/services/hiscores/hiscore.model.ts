export const enum PlayerType {
  Normal = 'normal',
  Ironman = 'ironman',
  Ultimate = 'ultimate',
  Hardcore = 'hardcore_ironman',
}

export const enum PlayerStatus {
  Default = 0,
  DeIroned = 1,
  DeUltimated = 2,
}

export class Player {
  constructor(
    public username: string,
    public playerType: PlayerType = 'normal' as PlayerType,
    public deIroned: PlayerStatus = 0,
    public dead: boolean = false,
    public lastChecked?: string
  ) {}
}

export class Skill {
  constructor(public name: string, public rank: string, public level: string, public exp: string) {}
}

export class Minigame {
  constructor(public name: string, public rank: string, public amount: string) {}
}

export class Hiscore {
  constructor(
    public player: Player,
    public type: string,
    public skills: Skill[],
    public cluescrolls: Minigame[],
    public bountyhunter: Minigame[],
    public lms: { rank: string; score: string },
    public srcString: string
  ) {}
}
