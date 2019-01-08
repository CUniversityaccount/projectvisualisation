import json
import csv

def load_data(name):
    area_codes = []
    with open(name, 'r') as read:
        data = json.load(read)
        areas = data[list(data.keys())[1]]
        for area in areas:
            area_information = area[list(area.keys())[-1]]
            area_codes.append(area_information[list(area_information.keys())[0]])
    area_codes.append("STAD")

    return area_codes

def parse_data(list, file):
    count = 0
    temp_list = []
    with open(file, newline="") as file:
        reader = csv.reader(file, delimiter=";", quotechar="|")
        for row in reader:
            if row[1] in list and int(row[0]) < 2019:
                temp_list.append(row)

    with open("data.csv", "w", newline="") as file:
        writer= csv.writer(file,  delimiter=' ', quotechar='|')
        for data in temp_list:
            writer.writerow(data)




if __name__ == "__main__":
    list = load_data('GEBIEDEN22.json')
    parse_data(list, "data.csv")
