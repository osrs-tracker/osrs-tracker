export class Player {
  constructor(
    public username: string,
    public playerType?: string,
    public deIroned: boolean = false,
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
