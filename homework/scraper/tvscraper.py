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
import re

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
# extra url lacking runtime to check
# TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&start=1&title_type=tv_series&sort=runtime,desc&page=29&ref_=adv_nxt"
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
    # create head list to contain a list per movie
    multiple_movies = []

    # iterate over top 50 series on imdb
    for link in dom.find_all('div', class_="lister-item-content"):

        #create a list for current movie
        one_movie = []

        # ensure title is available on imdb
        if not link.h3.a.text:
            title = "unknown"

        # retrieve title from imdb
        else:
            title = link.h3.a.text

        # add title to list current movie
        one_movie.append(title)

        # ensure rating is available on imdb
        rating = link.find('div', class_="inline-block ratings-imdb-rating")
        if not rating.strong.text:
            rating_text = "unknown"

        # retrieve rating from imdb
        else:
            rating_text = rating.strong.text

        # add rating to list current movie
        one_movie.append(rating_text)

        # ensure genres are available on imdb
        genres = link.p.find('span', class_ = "genre")
        if not genres.text:
            genres_text = "unknown"

        # retrieve genres from imdb
        else:
            genres_text = genres.text.strip()

        # add genres to list current movie
        one_movie.append(genres_text)

        # ensure actors are available on imdb
        if not link.find_all(class_="", href=re.compile("name")):
            actor_list = "unknown"

        else:

            # create string to add actor names to
            actor_list = ""

            # retrieve actors from imdb
            actors = link.find_all(class_="", href=re.compile("name"))

            # create counter to separate actor names with comma's
            counter = 0
            for actor in actors:
                actor_name = actor.text

                # add comma before every actor name except first
                if counter != 0:
                    actor_list = actor_list + ", " + actor_name
                else:
                    actor_list += actor_name
                    counter += 1
        # add actors to list current movie
        one_movie.append(actor_list)

        # ensure runtime is available on imdb
        # wat als class verdwijnt als ie leeg is? bij de andere categorieën!
        if not link.p.find('span', class_ = "runtime"):
            runtime_time = "unknown"

        # retrieve runtime from imdb
        else:
            runtime = link.p.find('span', class_ = "runtime")
            runtime_text = runtime.text

            # ensure time in numbers only
            runtime_time = ""
            for let_or_num in runtime_text:
                if let_or_num.isnumeric() is True:
                    runtime_time += let_or_num

        # add runtime to list current movie
        one_movie.append(runtime_time)

        # add current movie to head list
        multiple_movies.append(one_movie)

        # how do I leave unicode out of output?
        print(one_movie)

    return multiple_movies


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # write list per movie to csv
    for movie in tvseries:
        writer.writerow(movie)


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
