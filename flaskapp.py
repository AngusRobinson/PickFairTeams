from flask import Flask, request, jsonify, render_template
from WebSynTeamPlus import SynTeamPlus
from flask_caching import Cache

cache = Cache()

app = Flask(__name__)
cache.init_app(app, config={'CACHE_TYPE': 'null'})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pick_teams', methods=['POST'])
def pick_teams():
    # Get the JSON data from the request
    input_data = request.get_json()

    # Extract the required fields from the input data
    proficiencies = input_data['proficiencies']
    num_teams = input_data['num_teams']

    # Prepare the data for the SynTeamPlus function
    data = {"prof": proficiencies}

    # Call the SynTeamPlus function with the given data and number of teams
    teams = SynTeamPlus(data, num_teams)

    # Create a response dictionary to hold the resulting teams
    response = {"teams": teams}

    # Return the JSON representation of the response dictionary
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
