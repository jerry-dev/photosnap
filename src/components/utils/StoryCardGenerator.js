

const storyCardGenerator = (section, metaData, displayOff = null) => {
    let html = ``;

    for (let i = 0; i < metaData.length; i++) {
        if (!metaData[i].sections.includes(section)) {
            continue;
        }
        
        html += `<story-card
            publishDate="${metaData[i].publishDate}"
            title="${metaData[i].title}"
            author="${metaData[i].author}"
            desktopImage="${metaData[i].desktopImage}"
            tabletImage="${metaData[i].tabletImage}"
            mobileImage="${metaData[i].mobileImage}"
            displayOff=${displayOff}
        ></story-card>`;
    }

    return html;
}

export default storyCardGenerator;