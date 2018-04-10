#!/usr/bin/env python
# Name: Rebecca de Feijter
# Student number: 10639918
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    # go over all 50 series
    for link in dom.find_all('div', class_="lister-item-content"):

        # get title
        title = link.h3.a.text
        print(title)
        # add title to list oid

        # get rating
        rating = link.find('div', class_="inline-block ratings-imdb-rating")
        rating_text = rating.strong.text
        print(rating_text)
        # add rating to list oid

        # get genres
        genres = link.p.find('span', class_ = "genre")
        genres_text = genres.text
        print(genres_text)
        # add Genres to list oid
        # haal enter eruit
        # waarom loopt ie bij mecanismo vast?

        # get actors
        classes = link.find_all('p')
        actor_class = classes[2]
        # print(actor_class)
        # actor_class = link.find('p', class_ = "")
        actors = actor_class.find_all('a')
        # optie toevoegen voor geen actors?
        # print(actors)
        for actor in actors:
            # optie toevoegen voor lege actor?
            actor_name = actor.text
            print(actor_name)
        # doe ze achter elkaar met komma zonder spatie
        # add Actors to list oid

        # get runtime
        runtime = link.p.find('span', class_ = "runtime")
        if not runtime.text:
            runtime_text = "unknown"
        else:
            runtime_text = runtime.text
        print(runtime_text)
        # add runtime_text to list oid
        # change to only Number (not min)

        # how do I leave unicode out of output?

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    return []   # REPLACE THIS LINE AS WELL AS APPROPRIATE


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, tvseries)
