import time


def time_decorator(f):
    def new_f(*args, **kwargs):
        t1 = time.time()
        r = f(*args, **kwargs)
        t2 = time.time()
        print(f'Time difference for {f.__name__}: {t2 - t1}')
        return r
    return new_f
