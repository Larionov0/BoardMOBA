import { distance } from "../tools/math_tools.js"


class MarksGenerator{
    generate_circle(center_i, center_j, radius, color){
        var f_radius = Math.floor(radius)
        var marks = []
        for (let i = center_i-f_radius; i<=center_i+f_radius; i++){
            for (let j = center_j-f_radius; j<=center_j+f_radius; j++){
                if (distance([i, j], [center_i, center_j]) <= radius)
                    marks.push({i:i, j:j, color: color})
            }
        }
        return marks
    }

    generate_romb(center_i, center_j, hd, color){
        var marks = []
        var start_i=center_i - hd; var start_j=center_j;

        for (let k=0; k<hd + 1; k++){  
            let cur_i=start_i+k; let cur_j=start_j+k;
            for (let d=0; d<hd + 1; d++){
                marks.push({i:cur_i+d, j:cur_j-d, color:color})
            }
        }
        for (let k=0; k<hd; k++){  // дозакрашиваем меньшие полосы, пропущенные предыдущим циклом
            let cur_i=start_i+1+k; let cur_j=start_j+k
            for (let d=0; d<hd; d++){
                marks.push({i: cur_i+d, j:cur_j-d, color:color})
            }
        }
        return marks
    }

    generate_square(center_i, center_j, hd, color){
        var marks = []
        for (let i=center_i-hd; i<=center_i+hd; i++){
            for (let j=center_j-hd; j<=center_j+hd; j++){
                marks.push({i:i, j:j, color:color})
            }
        }
        return marks
    }

    generate_around_point(c_i, c_j, color=null){
        var marks = []
        for (let i=c_i-1; i<=c_i+1; i++){
            for (let j=c_j-1; j<=c_j+1; j++){
                if (c_i==i && c_j==j) continue
                marks.push({i:i, j:j, color:color})
            }
        }
        return marks
    }


    generate_line(from_point, to_point, color=null){
        var marks = []
        if (from_point[1] == to_point[1]){  // vertical
            if (from_point[0] > to_point[0]) [from_point, to_point] = [to_point, from_point]
            for (let i=from_point[0]; i<=to_point[0]; i++){
                marks.push({i: i, j: from_point[1], color: color})
            }
        } else if (from_point[0] == to_point[0]){  // horisontal
            if (from_point[1] > to_point[1]) [from_point, to_point] = [to_point, from_point]
            for (let j=from_point[1]; j<=to_point[1]; j++){
                marks.push({j: j, i: from_point[0], color: color})
            }
        } else { console.error(`CANT GENERATE LINE: ${from_point} -> ${to_point}`) }

        return marks
    }
}

var marks_generator = new MarksGenerator()

export {marks_generator}