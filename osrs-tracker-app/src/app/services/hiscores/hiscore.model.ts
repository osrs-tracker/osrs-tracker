export class Hiscore {
  constructor(
    public username: string,
    public type: string,
    public deIroned: boolean,
    public dead: boolean,
    public skills: Skill[],
    public cluescrolls: Minigame[],
    public bountyhunter: Minigame[],
    public lms: { rank: string, score: string },
    public srcString: string
  ) { }
}

export class Skill {
  constructor(
    public name: string,
    public rank: string,
    public level: string,
    public exp: string,
  ) { }
}

export class Minigame {
  constructor(
    public name: string,
    public rank: string,
    public amount: string,
  ) { }
}
