class SkillObj:
    def __init__(self, name, img_src, cooldown, energy, description, func):
        self.name = name
        self.img_src = img_src
        self.cooldown = cooldown
        self.energy = energy
        self.description = description
        self.func = func

