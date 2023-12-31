from .effect_link import EffectLink

from .poison import Poison
from .bleeding import Bleeding
from .slowdown import Slowdown
from .solidity import Solidity
from .stun import Stun
from .toxicity import Toxicity
from .silence import Silence
from .delayed_damage import DelayedDamage, DelayedDamage_Effects

all_effects = [Poison, Bleeding, Slowdown, Solidity, Stun, Toxicity, Silence, DelayedDamage]
