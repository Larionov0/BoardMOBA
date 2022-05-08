from django.db import models


class UIAction(models.Model):
    update_id = models.IntegerField(primary_key=True)
    game_state = models.ForeignKey('GameState', on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=(('damage', 'damage'), ('redraw', 'redraw')))
    target_id = models.IntegerField(default=0)
    # target_type = models.CharField(max_length=15)
    duration = models.FloatField(default=0.3)

    def to_json(self):
        return {
            'update_id': self.update_id,
            'type': self.type,
            'target_id': self.target_id,
            'duration': self.duration
        }
