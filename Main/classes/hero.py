from Main.classes.skill import SkillObj


class HeroObj:
    def __init__(self, name, max_hp, max_energy, power, armor, magic, attack_range, attack_cost, skills):
        self.name = name
        self.max_hp = max_hp
        self.max_energy = max_energy
        self.power = power
        self.armor = armor
        self.magic = magic
        self.attack_range = attack_range
        self.attack_cost = attack_cost

        self.skills = skills

    @property
    def skills_dict(self):
        return {skill.name: skill for skill in self.skills}

    @property
    def img_src(self):
        return f'{self.name}/{self.name}.png'

    @property
    def token_img_src(self):
        return f'{self.name}_token.png'
