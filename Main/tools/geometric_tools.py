def check_is_point_in_square(i, j, square: list):
    return square[0] <= i < square[0] + square[2] and square[1] <= j < square[1] + square[3]
