from Main.classes.heroes.all_heroes import all_heroes
import random
from Main.models.marks_rule import *
from Main.models.effects.all_effects import *
from django.contrib.contenttypes.models import ContentType
from numpy import array


class Unit(models.Model):
    is_creature = True

    # name = models.CharField(default='Hero', max_length=30)
    # eng_name = models.CharField(default='Hero', max_length=30)
    _i = models.IntegerField(default=0)
    _j = models.IntegerField(default=0)

    game_state = models.ForeignKey('GameState', on_delete=models.CASCADE, blank=True, null=True, related_name='all_heroes')

    # index = models.IntegerField(default=0)
    # global_index = models.IntegerField(default=0)
    team = models.IntegerField(default=1)

    base_params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='base_hero')
    params = models.OneToOneField('HeroParams', on_delete=models.PROTECT, related_name='hero')

    hp = models.IntegerField(default=0)
    energy = models.IntegerField(default=0)
    attacks_during_turn = models.IntegerField(default=0)
    is_alive = models.BooleanField(default=True)

    class Meta:
        abstract = True

    # ---------------= coords

    @property
    def coords(self):
        return array([self._i, self._j])

    @property
    def i(self):
        return self._i

    @i.setter
    def i(self, value):
        self._i = value
        self.save()
        self.after_coords_change()

    @property
    def j(self):
        return self._j

    @j.setter
    def j(self, value):
        self._j = value
        self.save()
        self.after_coords_change()

    def change_coords(self, i, j):
        self._i = i
        self._j = j
        self.save()
        self.after_coords_change()

    def move(self, dir):
        if self.energy > self.params.slowdown:
            i, j = self.i, self.j
            if dir == 'w':
                i -= 1
            elif dir == 'a':
                j -= 1
            elif dir == 's':
                i += 1
            elif dir == 'd':
                j += 1

            if self.game_state.can_move_to_point(i, j):
                self.change_coords(i, j)

                self.energy -= 1 + self.params.slowdown
                self.save()
                self.generate_base_marks_rules()
                self.game_state.create_ui_redraw()
                return True
        return False

    def be_pushed(self, vector1, dist, callback=lambda obj: None, redraw=False):
        for i in range(dist):
            new_coords = [self.i + vector1[0], self.j + vector1[1]]
            obj = self.game_state.get_solid_obj_by_coords(*new_coords)
            if obj is None:
                self.change_coords(*new_coords)
            else:
                if redraw:
                    self.game_state.create_ui_redraw()
                callback(obj)
                break
        else:
            if redraw:
                self.game_state.create_ui_redraw()

    # --------------------------

    @property
    def userprofile(self):
        return self.game_state.lobby.userprofiles.get(team=self.team)

    def after_coords_change(self):
        self.delayed_damage_move_check()
        self.my_delayed_damage_move_check()

    def delayed_damage_move_check(self):
        for ef_link in self.effects.filter(is_alive=True, effect_table=ContentType.objects.get_for_model(DelayedDamage).id):
            if ef_link.effect.max_distance < distance(self.coords, ef_link.caster.coords):
                ef_link.die()

    def my_delayed_damage_move_check(self):
        for ef_link in self.my_effects.filter(is_alive=True, effect_table=ContentType.objects.get_for_model(DelayedDamage).id):
            if ef_link.effect.max_distance < distance(self.coords, ef_link.hero.coords):
                ef_link.die()

    def set_random_coords(self, n, m):
        self.i = random.randint(0, n-1)
        self.j = random.randint(0, m-1)
        self.save()

    # marks
    # effects
    # modificators
    # shields

    @property
    def color(self):
        return 'rgba(0, 0, 255, 0.3)' if self.team == 1 else 'rgba(255, 0, 0, 0.3)'

    def recalc_params(self):
        params = self.base_params
        params.pk = None
        params.save()

        self.params = params
        self.save()

        temp_modificators = []
        for effect_link in self.alive_effects:
            temp_modificators.extend(effect_link.effect.gen_modifiers(effect_link))

        for modifier in list(self.modifiers.filter(is_alive=True)) + temp_modificators:
            modifier.modify(self.params)

        self.params.can_autoattack = self.attacks_during_turn == 0
        self.params.save()

    @property
    def alive_effects(self):
        return self.effects.filter(is_alive=True)

    @property
    def alive_my_effects(self):
        return self.my_effects.filter(is_alive=True)

    @property
    def alive_shields(self):
        return self.shields.filter(is_alive=True)

    def clear_dead_effects(self):
        for effect_link in self.my_effects.filter(is_alive=False):
            effect_link.effect.delete()
        self.my_effects.filter(is_alive=False).delete()

        for effect_link in self.effects.filter(is_alive=False):
            effect_link.effect.delete()
        self.effects.filter(is_alive=False).delete()

    def clear_dead_modifiers(self):
        self.modifiers.filter(is_alive=False).delete()

    def clear_dead_shields(self):
        self.shields.filter(is_alive=False).delete()

    def before_move(self):
        self.energy = self.params.max_energy
        self.attacks_during_turn = 0
        self.recalc_params()
        self.save()

        for effect_link in self.alive_effects:
            effect_link.effect.before_target_move(effect_link)
        for effect_link in self.alive_my_effects:
            effect_link.effect.before_move(effect_link)
        self.clear_dead_effects()

        for shield in self.my_shields.filter(is_alive=True):
            shield.decrease_duration()
        self.clear_dead_shields()

        self.generate_base_marks_rules()
        if self.params.stun:
            self.game_state.end_turn()

    def after_move(self):
        for skill in self.skills.all():
            skill.after_move(self)

        for effect_link in self.alive_effects:
            effect_link.effect.after_target_move(effect_link)
        for effect_link in self.alive_my_effects:
            effect_link.effect.after_move(effect_link)

        for modifier in self.modifiers.filter(is_alive=True):
            modifier.decrease()
        self.clear_dead_modifiers()
        self.recalc_params()

    def try_make_autoattack(self, i, j):
        target = self.game_state.get_creature_by_coords(i, j)

        if target is None:
            return False
        if self.energy < self.params.attack_cost:
            return False
        if self.team == target.team:
            return False
        if distance(self.coords, target.coords) > self.params.attack_range:
            return False

        self.make_autoattack(target)
        return True

    def put_effects_on_autoattack(self, target):
        if self.params.toxicity_value > 0:
            target.get_effect(EffectLink.objects.create(
                hero=target,
                caster=self,
                effect=Poison.objects.create(
                    duration=self.params.toxicity_duration,
                    value=self.params.toxicity_value
                )
            ))

    def make_autoattack(self, target):
        target.get_damage(self.params.power)
        self.put_effects_on_autoattack(target)

        self.energy -= self.params.attack_cost
        self.attacks_during_turn += 1
        self.save()
        self.recalc_params()
        self.game_state.create_ui_action('damage', target.id, duration=0.3)

        self.recalc_params()

        self.generate_base_marks_rules()
        self.game_state.create_ui_redraw()

    def heal(self, hp):
        self.hp += hp
        if self.hp > self.params.max_hp:
            self.hp = self.params.max_hp
        self.save()

    def take_damage_through_shields(self, damage):
        shields = self.alive_shields.order_by('duration')
        for shield in shields:
            damage = shield.get_damage(damage)
            if damage <= 0:
                damage = 0
                break

        return damage

    def get_damage(self, damage):
        if self.params.solidity is True:
            solidity_link = self.alive_effects.get(effect_table=ContentType.objects.get_for_model(Solidity).id)
            solidity_link.effect.decrease_duration(solidity_link)
            self.recalc_params()
            return

        damage = self.take_damage_through_shields(damage)

        remaining_damage = damage - self.params.armor
        if remaining_damage > 0:
            self.loose_hp(remaining_damage)

    def loose_hp(self, damage):
        self.hp -= damage
        self.save()
        if self.hp <= 0:
            self.die()

    def die(self):
        self.is_alive = False
        self.i = -1
        self.j = -1
        self.save()

    def get_effect(self, effect_link):
        effect_link.effect.on_getting(effect_link)
        self.recalc_params()

    def get_modifier(self, modifier, recalc=True):
        if recalc:
            self.recalc_params()

    def get_shield(self, shield):
        pass

    def teleport(self, i, j):
        self.i = i
        self.j = j
        self.save()

    def __str__(self):
        return f"Unit {self.id} ({self.game_state.id})"
