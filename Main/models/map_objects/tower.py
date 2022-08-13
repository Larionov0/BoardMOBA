from django.db import models


class Tower(models.Model):
    hp = models.IntegerField()
    team = models.IntegerField()
    number = models.IntegerField()
    game_state = models.ForeignKey('GameState', models.CASCADE)

    @property
    def coords(self):
        return {
            1: {1: [0, 10], 2: [6, 13]},
            2: {1: [32, 10], 2: [26, 7]}
        }[self.team][self.number]
    
    @property
    def max_hp(self):
        return {1: 300, 2: 150}
    
    @property
    def range(self):
        return {
            1: {
                1: [0, 6, 6, 10],  # i, j, h, w
                2: [5, 6, 7, 8]
            },
            2: {
                1: [28, 6, 6, 10],
                2: [22, 7, 7, 8]
            }
        }

    @property
    def damage(self):
        return {1: 25, 2: 20}

    def __str__(self):
        return
