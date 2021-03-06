import scrapy, os, json
from inline_requests import inline_requests

# Check URL
check_url = lambda x: not any(['supplementary' in x.css('::text').extract_first().lower(), '@' in x.css('::text').extract_first(), x.css('::attr("href")').extract_first() == None])

class JournalSpider(scrapy.Spider):

    # Setup
    name = "oxford"
    journals = ['bioinformatics', 'nar', 'database']
    start_urls = ['https://academic.oup.com/'+x+'/issue-archive' for x in journals]

    # Parse archive
    def parse(self, response):

        # Get minimum year
        from_year = 2010

        # Loop through years
        for year_link in response.css('.widget-instance-OUP_Issues_Year_List div a::attr(href)').extract():

            # Minimum year
            if int(year_link.split('/')[-1]) >= from_year:
                
                # Parse year
                yield scrapy.Request('https://academic.oup.com'+year_link, callback=self.parse_year)

    # Parse year
    def parse_year(self, response):

        # Loop through archives
        for i, issue_link in enumerate(response.css('.widget-instance-OUP_Issues_List div a::attr(href)').extract()):
                
            # Parse archive
            yield scrapy.Request('https://academic.oup.com'+issue_link, callback=self.parse_issue)

    # Parse issue
    @inline_requests
    def parse_issue(self, response):

        # Define articles
        articles = {'article_data': []}

        # Split URL
        split_url = response.url.split('/')

        # Get journal name
        journal_name = split_url[3]

        # Get base directory
        basedir = os.getcwd().replace('/pipeline/scrapy', '/01-journals')

        # If database
        if journal_name == 'database':
            outfile = os.path.join(basedir, journal_name, '_'.join([journal_name, 'vol'+split_url[-1]])+'.json')
        else:
            outfile = os.path.join(basedir, journal_name, '_'.join([journal_name, 'vol'+split_url[-2], 'issue'+split_url[-1]])+'.json')

        # Check if outfile exists
        if not os.path.exists(outfile):

            # Loop through articles
            for i, article_link in enumerate(response.css('.viewArticleLink::attr(href)').extract()):

                # Parse archive
                article = yield scrapy.Request('https://academic.oup.com'+article_link)

                # Get data
                articles['article_data'].append({
                    'article_title': ''.join(article.css('.wi-article-title::text, .wi-article-title em::text').extract()).strip(), #add span
                    'authors': article.css('.al-author-name .info-card-name::text').extract(),
                    'doi': article.css('.ww-citation-primary a::text').extract_first(),
                    'abstract': [[p.css('strong::text').extract_first(), ''.join(p.css(':not(strong)::text, :not(strong) em::text').extract()).strip()] for p in article.css('.abstract p')],
                    'date': article.css('.citation-date::text').extract_first(),
                    'links': list(set([a.css('::attr("href")').extract_first() for a in article.css('.abstract a') if check_url(a)]))
                })

            # Save data
            with open(outfile, 'w') as openfile:
                openfile.write(json.dumps(articles, indent=4))


