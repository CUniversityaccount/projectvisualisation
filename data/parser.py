import json
import csv
import sys

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

def parse_data(list, variables, file):

    count = 0
    temp_list = []
    variable = []

    leeftijd = []
    achtergrond = []

    with open(variables, "r", newline="") as data:
        reader = csv.reader(data, delimiter=",", quotechar="|")
        for row in reader:
            if row[0] != "":
                variable.append(row[0])

    with open(file, "r", newline="") as data_area:
        reader = csv.reader(data_area, delimiter=" ", quotechar="|")
        for row in reader:
            if row[1] in list and int(row[0]) < 2019:
                temp_list.append(row)



    with open("data.csv", "w", newline="") as write:
        writer= csv.writer(write,  delimiter=' ', quotechar='|')
        for data in temp_list:
            if data[2] in variable:
                writer.writerow(data)

    totaal = variable[0]
    general = variable[1:3]
    background = variable[3:11]
    age = variable[11:]

    return general, background, age, totaal
def make_json(list, variables):
    dict = {}

    for variable in list:
        dict[variable] = {}



    with open("data.csv", "r", newline="") as parsed:
        reader = csv.reader(parsed, delimiter=" ", quotechar="|")
        for row in reader:
            if not int(row[0]) in dict[row[1]].keys():
                dict[row[1]][int(row[0])] = {}
            if row[2] in variables[0]:
                if not "general" in dict[row[1]][int(row[0])]:
                    dict[row[1]][int(row[0])]["general"] = {}
                dict[row[1]][int(row[0])]["general"][row[2]] = row[-1]


            elif row[2] in variables[1]:
                if not "background" in dict[row[1]][int(row[0])]:
                    dict[row[1]][int(row[0])]["background"] = {}
                dict[row[1]][int(row[0])]["background"][row[2]] = row[-1]

            elif row[2] in variables[2]:
                if not "age" in dict[row[1]][int(row[0])]:
                    dict[row[1]][int(row[0])]["age"] = {}

                dict[row[1]][int(row[0])]["age"][row[2]] = row[-1]
            elif row[2] in variables[-1]:
                dict[row[1]][int(row[0])][row[2]] = row[-1]

    with open('bev_amsterdam.json', 'w') as json_file:
        json.dump(dict, json_file, sort_keys = True, indent = 4,
               ensure_ascii = False)

if __name__ == "__main__":
    list = load_data('GEBIEDEN22.json')
    variables = parse_data(list, "metadata.csv", "dataoftheareas.csv")
    make_json(list, variables)
