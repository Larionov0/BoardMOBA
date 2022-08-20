from django.db import models


class Tower(models.Model):
    HP_DICT = {1: 300, 2: 150}

    hp = models.IntegerField()
    team = models.IntegerField()
    number = models.IntegerField()
    game_state = models.ForeignKey('GameState', models.CASCADE, related_name='towers')

    @property
    def coords(self):
        return {
            1: {1: [0, 10], 2: [6, 13]},
            2: {1: [32, 10], 2: [26, 7]}
        }[self.team][self.number]

    @property
    def i(self):
        return self.coords[0]

    @property
    def j(self):
        return self.coords[1]
    
    @property
    def max_hp(self):
        return self.HP_DICT[self.number]
    
    @property
    def range(self):
        return {
            1: {
                1: [0, 6, 6, 10],  # i, j, h, w
                2: [5, 7, 7, 8]
            },
            2: {
                1: [28, 6, 6, 10],
                2: [22, 7, 7, 8]
            }
        }[self.team][self.number]

    @property
    def damage(self):
        return {1: 25, 2: 20}[self.number]

    @property
    def color(self):
        return {1: 'blue', 2: 'red'}[self.team]

    def to_dict(self):
        return {
            'i': self.i,
            'j': self.j,
            'color': self.color,
            'hp': self.hp,
            'max_hp': self.max_hp
        }

    def __str__(self):
        return
