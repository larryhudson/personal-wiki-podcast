import wiki from "wikipedia";
import cheerio from "cheerio";

export async function getWikiSearchResults(searchQuery) {
  const searchResult = await wiki.search(searchQuery, {suggestion: true, limit: 10});

  return searchResult.results;
}

export async function getWikiPageLinks(pageId) {
  const page = await wiki.page(pageId);

  const content = await page.html();

  const $ = cheerio.load(content);

  const links = $('a[href^="/wiki/"][title]').map((_, aTag) => {
    const title = $(aTag).attr('title');
    const url = $(aTag).attr('href');

    return {title, url}
  }).get();

  return links;
}

function preprocessContent($) {
  
  const selectorsToRemove = [
    "figure", "img", "figcaption", "sup.reference", "sup.noprint", "div.thumb", "table.infobox", "table.sidebar", "ol.references", ".mw-editsection", "table.wikitable", ".refbegin", ".navbox", ".ambox", ".navigation-not-searchable"
  ]

  selectorsToRemove.forEach(selector => {
    $(selector).remove();
  })

  $('a[href^="/wiki"]').each((_, aTag) => {
    const originalLink = $(aTag).attr('href');
    const newLink = `/articles${originalLink}`;
    $(aTag).attr('href', newLink);
  });
}


function getCostEstimate(numChars) {
  const AUD_PER_CHARACTER = 0.000024241;
  const costUnrounded = numChars * AUD_PER_CHARACTER;
  const costRounded = Math.round(costUnrounded * 100) / 100;
  return costRounded;
}

function getSectionDataFromContentTags($, contentTags) {

  const links = $(contentTags).find('a[href^="/wiki/"][title]').map((_, aTag) => {
    const title = $(aTag).attr('title');
    const url = $(aTag).attr('href');

    return {title, url}
  }).get();

  const content = $.html(contentTags);

  const contentText = $.text(contentTags);
  const textLength = contentText.length;

  const costEstimateAud = getCostEstimate(textLength);

  return {
    content,
    headingTag: 'h2',
    textLength,
    costEstimateAud,
    links,
  }
}


export async function getWikiPageSections(pageId) {

  const page = await wiki.page(pageId);

  const content = await page.html();

  const $ = cheerio.load(content);

  preprocessContent($);

  const headingSelector = "h1,h2,h3,h4,h5,h6";

  // TODO: this stuff is hacky!

  const firstHeading = $(headingSelector).first();

  const topLevelParentOfFirstHeading = $(firstHeading).parentsUntil('.toc').last().parent();

  const firstTag = $(topLevelParentOfFirstHeading).prevAll().last();

  const firstSectionContentTags = $(firstTag).nextUntil(topLevelParentOfFirstHeading);

  const firstSection = getSectionDataFromContentTags($, firstSectionContentTags);

  firstSection.title = 'Introduction';

  const headingSections = $(headingSelector).map((_, headingTag) => {

    const contentTags = $(headingTag).nextUntil(headingSelector).addBack();

    const sectionData = getSectionDataFromContentTags($, contentTags);
    
    sectionData.headingTag = $(headingTag).prop('tagName').toLowerCase();
    sectionData.title = $(headingTag).text().trim();
  
    return sectionData;
  }).get().filter(section => section.title !== 'Contents');

  const allSections = [firstSection, ...headingSections];

  const totalCostEstimateAud = allSections.reduce((previousSum, currentSection) => {
    return previousSum + currentSection.costEstimateAud;
  }, 0);
  
  return {
    pageSections: allSections,
    totalCostEstimateAud
  };
}

export async function getSectionsByWikiIdAndIndex({wikiPageId, sectionIndices}) {
  const {pageSections} = await getWikiPageSections(wikiPageId)

  const sectionsToSave = pageSections
    .filter((item, index) => {
    return sectionIndices.includes(index)
  })

    return sectionsToSave;
}
