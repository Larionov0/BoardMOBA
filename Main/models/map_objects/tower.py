from django.db import models
from Main.tools.math_tools import distance
from Main.tools.geometric_tools import check_is_point_in_square


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
    def center(self):
        return [self.i + 0.5, self.j + 0.5]

    # @property
    # def center(self):
    #     return {
    #         1: [self.i + 1, self.j],
    #         2: [self.i, self.j + 1]
    #     }[self.team]

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

    def check_is_obj_in_range(self, enemy):
        return check_is_point_in_square(*enemy.coords, self.range)

    def find_closest_enemy(self, enemies: list):
        return min(enemies, key=lambda enemy: distance(enemy.coords, self.center))

    def my_turn(self):
        enemies = self.game_state.get_alive_creatures_by_team(3 - self.team)
        enemy = self.find_closest_enemy(enemies)
        if self.check_is_obj_in_range(enemy):
            self.shoot(enemy)
            self.game_state.create_ui_action('damage', enemy.id)
            self.game_state.create_ui_redraw()

    def shoot(self, enemy):
        enemy.get_damage(self.damage)

    def __str__(self):
        return
