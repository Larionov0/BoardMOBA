function distance(point1, point2){
    return Math.sqrt((point2[0] - point1[0])**2 + (point2[1] - [point1[1]])**2)
} 


function get_vector(point1, point2){
    return [point2[0] - point1[0], point2[1] - point1[1]]
}

function get_perp_vectors(vector){
    return [[-vector[1], vector[0]], [vector[1], -vector[0]]]
}

function calc_point(point1, vector){
    return [point1[0] + vector[0], point1[1] + vector[1]]
}

function get_surrounding_4_points(point){
    return [
        [point[0]-1, point[1]],
        [point[0], point[1]+1],
        [point[0]+1, point[1]],
        [point[0], point[1]-1]
    ]
}


export {distance, get_vector, get_perp_vectors, calc_point, get_surrounding_4_points}