let stream = {records: [], display_cache: []};
let slides = {records: []};

function slides_load_data(callback) {
    app_load_json(slides, '/database/slides.json', callback, null);
}

function slides_render() {
    function create_indicator(i) {
        let html = '<button type="button" data-bs-target="#stream-slides" data-bs-slide-to="'+i+'" aria-label="Slide '+(i+1)+'"';
        if(i===0) {
            html += '  class="active" aria-current="true"';
        }
        return html + '></button>';
    }

    function create_slide(title, image_class, image_url, url, y_url, b_url) {
        let target_url = url;
        if(target_url.length === 0) {
            //Find a valid url.
            target_url = app_archive_url(y_url, b_url);
        }
        let slide_html = [
            '<div class="carousel-item'+image_class+'">',
            app_hyperlink(target_url),
            '<img class="bd-placeholder-img" width="100%" height="100%" src="'+image_url+'">',
            '<div class="carousel-caption">',
            '<div class="carousel-holder">',
            '   <h1>'+title+'</h1>',
            '   <p></p>',
            '   <p></p>',
            '</div>',
            '</div>',
            '</a>',
            '</div>'
        ]
        return slide_html.join('\n');
    }

    // Render the indicator and slides.
    let indicator = [], item_data = [];
    for(let i=0; i<slides.records.length; ++i) {
        // Dot
        let indicator_class = (i === 0) ? " active" : "";
        indicator.push(create_indicator(i));
        const item_info = slides.records[i];
        let slide_title = item_info.title, image_url = '/', s_url = '', s_y_url = '', s_b_url = '';
        if(slide_title.startsWith('$#')) {
            slide_title = slide_title.substr(2);
            //Update the image url.
            image_url = '/asserts/slides/' + slide_title + '.jpg';
            //Check the title is valid or not.
            if(slide_title === 'last_live' || slide_title === 'last_song_live') {
                //Find the last live but not song stream.
                function find_last_stream(is_song) {
                    for(let i=0; i<stream.records.length; ++i) {
                        if(stream.records[i][5] === is_song) {
                            return stream.records[i];
                        }
                    }
                    return undefined;
                }
                const target_stream = find_last_stream(slide_title === 'last_song_live');
                if(target_stream !== undefined) {
                    slide_title = target_stream[1];
                    s_y_url = target_stream[2];
                    s_b_url = target_stream[3];
                }
            }
        } else {
            image_url = item_info.img;
            s_url = item_info.url;
            s_y_url = item_info['youtube-url'];
            s_b_url = item_info['bilibili-url'];
        }
        item_data.push(create_slide(slide_title, indicator_class, image_url, s_url, s_y_url, s_b_url));
    }
    document.getElementById('slides-indicator').innerHTML = indicator.join('\n');
    document.getElementById('slides-items').innerHTML = item_data.join('\n');
}

function stream_load_data(callback) {
    app_load_json(stream, '/database/videos.json', callback, function(video_data) {
        for(let i=0; i<video_data.length; ++i) {
            video_data[i][4] = new Date(video_data[i][4]);
        }
        return video_data;
    });
}

function stream_render_result() {
    document.getElementById();
}

function render_main_page() {
    app_load_panel('stream.html', function() {
        // Render the slides.
        slides_render();
        // Render the forecast.
        forecast_render();
        // Prepare the search box.
        document.getElementById('stream-search').setAttribute('placeholder', app_i18n.search_stream);

    });
}

function load_streams() {
    document.title = app_i18n.title_stream;
    header_set_item('nav-stream');
    // Load all slide data first.
    slides_load_data(function() {
        forecast_load_data(function() {
            // Load all the stream data.
            song_list_load_data(function() {
                stream_load_data(function() {
                    //Extract the song_list date.
                    let song_date = [];
                    for(let i=0; i<song_list.records.length; ++i) {
                        song_date.push(new Date(song_list.records[i].date));
                    }
                    song_date = new Set(song_date);
                    song_date.has = function(a1) {
                        if(a1 instanceof Date) {
                            for(let a2 of this) {
                                if (a1.getFullYear() === a2.getFullYear() && a1.getMonth() === a2.getMonth() && a1.getDate() === a2.getDate()) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                    //Loop append the song live date.
                    for(let i=0; i<stream.records.length; ++i) {
                        stream.records[i].push(song_date.has(stream.records[i][4]));
                    }
                    // Render the stream information list.
                    render_main_page();
                });
            });
        });
    });
}