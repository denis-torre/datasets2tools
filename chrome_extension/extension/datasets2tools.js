//////////////////////////////////////////////////////////////////////
///////// 1. Define Main Function ////////////////////////////////////
//////////////////////////////////////////////////////////////////////
////////// Author: Denis Torre
////////// Affiliation: Ma'ayan Laboratory, Icahn School of Medicine at Mount Sinai
////////// Based on Cite-D-Lite (https://github.com/MaayanLab/Cite-D-Lite).

function main() {

	// Locate parents on HTML page
	var parents = Page.locateParents();

	// Add Canned Analyses
	var cannedAnalysisInterfaces = Interfaces.add(parents);

	// Add event listeners for interactivity
	eventListener.main();
	
}

//////////////////////////////////////////////////////////////////////
///////// 2. Define Variables ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
////////// 1. Page ///////////////////////////////
//////////////////////////////////////////////////

///// Functions related to the webpage.

var Page = {

	//////////////////////////////
	///// 1. isDataMedSearchResults
	//////////////////////////////

	///// Returns true if the user is on a DataMed search results page, otherwise false

	isDataMedSearchResults: function() {
		return /.*search.php.*/.test(window.location.href);
	},

	//////////////////////////////
	///// 2. isDataMedLanding
	//////////////////////////////

	///// Returns true if the user is on a DataMed dataset landing page, otherwise false

	isDataMedLanding: function() {
		return /.*display-item.php.*/.test(window.location.href);
	},

	//////////////////////////////
	///// 3. isGeoSearchResults
	//////////////////////////////

	///// Returns true if the user is on a GEO search results page, otherwise false

	isGeoSearchResults: function() {
		return /.*gds\/\?term=.*/.test(window.location.href);
	},

	//////////////////////////////
	///// 4. isGeoDatasetLanding
	//////////////////////////////

	///// Returns true if the user is on a GEO dataset landing page, otherwise false

	isGeoDatasetLanding: function() {
		return /.*sites\/GDSbrowser\?acc=.*/.test(window.location.href);
	},

	//////////////////////////////
	///// 5. isGeoSeriesLanding
	//////////////////////////////

	///// Returns true if the user is on a GEO series landing page, otherwise false

	isGeoSeriesLanding: function() {
		return /.*geo\/query\/acc.cgi\?acc=.*/.test(window.location.href);
	},

	//////////////////////////////
	///// 6. locateParents
	//////////////////////////////

	///// Locates HTML elements which will be used to extract dataset accessions and append the interfaces

	locateParents: function() {
		var parents = {};
		if (Page.isDataMedSearchResults()) {
			$('.search-result li').each(function(i, elem){ parents[$(elem).find('em:contains(ID:) + span').text().trim()] = $(elem) });
		} else if (Page.isDataMedLanding()) {
			$('#accordion-dataset').each(function(i, elem) { parents[$(elem).find('strong:contains(ID:)').parent().next().children(0).text().trim()] = $(elem) });
		} else if (Page.isGeoSearchResults()) {
			$('.rslt').each(function(i, elem) { parents[$(elem).find('.details').find('.lng_ln').last().find('a').text().trim()] = $(elem) });
		} else if (Page.isGeoDatasetLanding()) {
			$('#gds_details').each(function(i, elem) { parents[$(elem).find('th:contains(Reference Series:)').next().text().trim()] = $(elem) });
		} else if (Page.isGeoSeriesLanding()) {
			$('.acc').each(function(i, elem) { parents[$(elem).attr('id')] = $(elem).parents().eq(7) });
		}
		return parents;
	},

	//////////////////////////////
	///// 8. addInterfaces
	//////////////////////////////

	///// Adds interfaces to parents

		addInterface: function(analysisInterface, parentDiv) {

			if (Page.isDataMedSearchResults() || Page.isGeoSearchResults()) {
				parentDiv.append(analysisInterface);
			} else if (Page.isDataMedLanding()) {

				parentDiv.after($('<div>', {'id':'accordion-d2t', 'class': 'panel-group', 'role': 'tablist', 'aria-multiselectable': 'true'})
									.html($('<div>', {'class': 'panel panel-info'})
										.append($('<div>', {'id': 'heading-dataset-d2t', 'class': 'panel-heading', 'role': 'tab'})
											.html($('<h4>', {'class': 'panel-title'})
												.html($('<a>', {'role': 'button', 'data-toggle': 'collapse', 'data-parent': '#accordion-d2t', 'data-target': 'collapse-dataset-d2t', 'aria-expanded': 'true', 'aria-controls': 'collapse-dataset-d2t'})
													.append($('<i>', {'class': 'fa fa-chevron-up'}))
													.append(' Canned Analyses'))))
										.append($('<div>', {'id': 'collapse-dataset-d2t', 'class': 'panel-collapse collapse in', 'role': 'tabpanel', 'aria-labelledby': 'heading-dataset-d2t'})
											.html($('<div>', {'class': 'panel-body d2t-landing-wrapper d2t-datamed'})
												.html(analysisInterface)))));

			} else if (Page.isGeoSeriesLanding()) {

				parentDiv.after($('<table>', {'class': 'd2t-geo d2t-gse d2t-landing-wrapper'})
									.html($('<tbody>')
										.append($('<tr>')
											.html($('<th>')
												.html('Canned Analyses')))
										.append($('<tr>')
											.html($('<td>')
												.html(analysisInterface)))))

			} else if (Page.isGeoDatasetLanding()) {

				parentDiv.after($('<table>', {'class': 'd2t-geo d2t-gds gds_panel d2t-landing-wrapper'})
									.html($('<tbody>')
										.append($('<tr>', {'class': 'caption'})
											.html($('<th>')
												.html('Canned Analyses')))
										.append($('<tr>')
											.html($('<td>')
												.html(analysisInterface)))));
			}
	}
};

//////////////////////////////////////////////////
////////// 2. Interfaces /////////////////////////
//////////////////////////////////////////////////

///// Functions related to the interface.

var Interfaces = {

	//////////////////////////////
	///// 1. Create Search Interface
	//////////////////////////////

	///// Gets interfaces relevant to identified datasets from the API on search pages

	createSearchInterface: function(apiData, datasetAccession) {

		// Get page class
		if (Page.isDataMedSearchResults() || Page.isDataMedLanding()) {
			pageClass = 'datamed'
		} else if (Page.isGeoSearchResults() || Page.isGeoSeriesLanding() || Page.isGeoDatasetLanding()) {
			pageClass = 'geo'
		}

		// Get toolbar
		$toolbar = $('<div>', {'class': 'd2t-toolbar'})
						.append($('<div>', {'class': 'd2t-logo-wrapper'})
							.html($('<a>', {'href': 'https://amp.pharm.mssm.edu/datasets2tools/landing/dataset/'+datasetAccession, 'target': '_blank'})
								.html($('<img>', {'class': 'd2t-logo', 'src': 'https://amp.pharm.mssm.edu/datasets2tools/static/icons/datasets2tools-blue.png'}))))
						.append($('<div>', {'class': 'd2t-tool-icon-outer-wrapper'})
							.html($('<div>', {'class': 'd2t-tool-icon-inner-wrapper'})));

		$.each(apiData, function(toolName, toolData) { $toolbar.find('.d2t-tool-icon-inner-wrapper')
														.append($('<img>', {'class': 'd2t-tool-icon', 'src': toolData['tool_icon_url'], 'data-tool-name': toolName, 'data-toggle': "d2t-tooltip", 'data-placement': "top", 'data-html': "true", 'data-original-title': "<div class='d2t-tool-icon-tooltip'><div class='d2t-tool-icon-tooltip-name'>"+toolName+"</div><div class='d2t-tool-icon-tooltip-count'>"+toolData['canned_analyses'].length+" analyses</div><div class='d2t-tool-icon-tooltip-description'>"+toolData['tool_description']+"</div></div>"}))});

		// Get tool info
		$toolinfo = $('<div>', {'class': 'd2t-tool-info-wrapper'})
						.append($('<div>', {'class': 'd2t-logo-wrapper'})
								.append($('<img>', {'class': 'd2t-back-arrow', 'src': 'https://image.freepik.com/free-icon/left-arrow-inside-a-circle_318-42520.jpg'})));

		$.each(apiData, function(toolName, toolData) { $toolinfo.append($('<div>', {'id': datasetAccession+'-'+toolName+'-info', 'class': 'd2t-tool-info'})
																			.append($('<div>', {'class': 'd2t-tool-icon-outer-wrapper'})
																				.html($('<div>', {'class': 'd2t-tool-icon-inner-wrapper'})
																					.html($('<img>', {'class': 'd2t-tool-icon', 'src': toolData['tool_icon_url']}))))
																			.append($('<div>', {'class': 'd2t-tool-info-text-wrapper'})
																				.append($('<div>', {'class': 'd2t-tool-info-tool-name'})
																					.html($('<a>', {'href': 'https://amp.pharm.mssm.edu/datasets2tools/landing/tool/'+toolName})
																						.html(toolName)))
																				.append($('<div>', {'class': 'd2t-tool-info-tool-description'})
																					.html(toolData['tool_description'])))
																			)});

		// Get tables
		$tables = $('<div>', {'class': 'd2t-table-wrapper'});
		$.each(apiData, function(toolName, toolData) {

			// Table header
			$tables.append($('<div>', {'class': 'd2t-individual-table-wrapper', 'id': datasetAccession+'-'+toolName+'-wrapper'}).html(
				$('<table>', {'id': datasetAccession+'-'+toolName+'-table', 'class': 'd2t-table  d2t-datatable'})
					.append($('<thead>')
						.html($('<tr>')
							.append($('<th>').html('Link'))
							.append($('<th>').html('Description'))
							.append($('<th>').html('Metadata'))))));

			// Table rows
			$.each(toolData['canned_analyses'], function(index, analysisData) {
				$tables.find('#'+datasetAccession+'-'+toolName+'-table')
					.append($('<tbody>')
						.append($('<tr>')
							.append($('<td>', {'class': 'd2t-link-col'})
								.html($('<a>', {'href': analysisData['canned_analysis_url'], 'target': '_blank'})
									.html($('<img>', {'class': 'd2t-link-icon', 'src': toolData['tool_icon_url']}))))
							.append($('<td>', {'class': 'd2t-description-col'})
								.html($('<span>', {'data-toggle': "d2t-tooltip", 'class':'d2t-analysis-title', 'data-placement': "top", 'data-html': "true", 'data-original-title': "<div class='d2t-canned-analysis-description-tooltip'>"+analysisData['canned_analysis_description']+""})
									.html(analysisData['canned_analysis_title'])))
							.append($('<td>', {'class': 'd2t-metadata-col'})
								.html($('<i>', {'class': 'fa fa-info-circle d2t-metadata-icon', 'data-toggle': "d2t-tooltip", 'data-placement': "top", 'data-html': "true"})))));

				// Row metadata tooltips
				metadataTooltip = $('<div>', {'class': 'd2t-metadata-tooltip'}).html($('<ul>', {'class': 'd2t-metadata-list'}));
				$.each(analysisData['metadata'], function(termName, termValue) {
					metadataTooltip.find('ul').append($('<li>')
						.append($('<span>', {'class': 'd2t-metadata-term'})
							.html(termName+':'))
						.append($('<span>', {'class': 'd2t-metadata-value'})
							.html(termValue)))
				});
				$tables.find('#'+datasetAccession+'-'+toolName+'-table i').last().attr('data-original-title', metadataTooltip.html())

			});

		});

		// Return
		return $('<div>', {'data-dataset-accession': datasetAccession, 'class': 'd2t-wrapper d2t-' + pageClass})
					.append($toolbar)
					.append($toolinfo)
					.append($tables);
	},

	//////////////////////////////
	///// 2. Create Landing Interface
	//////////////////////////////

	///// Gets interfaces relevant to identified datasets from the API on landing pages

	createLandingInterface: function(apiData, datasetAccession) {
		
		// Get tool table
		$toolTable = $('<table>', {'class': 'd2t-tool-table table-striped'})
						.append($('<thead>')
							.html($('<tr>')
								.append($('<th>').html('Tool'))
								.append($('<th>').html('Description'))
								.append($('<th>').html('Analyses'))))
						.append($('<tbody>'));

		$.each(apiData, function(toolName, toolData) {
			$toolTable.find('tbody')
				.append($('<tr>')
					.append($('<td>', {'class': 'tool-table-tool-col'})
						.append($('<div>', {'class': 'd2t-tool-table-tool-col-wrapper'})
							.append($('<img>', {'src': toolData['tool_icon_url'], 'class': 'd2t-tool-icon'}))
							.append($('<div>', {'class': 'd2t-tool-table-tool-name'})
								.html(toolName))))
					.append($('<td>', {'class': 'tool-table-description-col'})
						.html(toolData['tool_description']))
					.append($('<td>', {'class': 'tool-table-number-col'})
						.append($('<span>')
							.html(toolData['canned_analyses'].length))
						.append($('<i>', {'class': 'fa fa-plus-square-o d2t-expand', 'data-tool-name': toolName}))))
		});

		// Get analysis tables
		$analysisTables = $('<div>');
		$.each(apiData, function(toolName, toolData) {

			// Tool info
			$analysisTables.append($('<div>', {'id': toolName+'-wrapper', 'class': 'd2t-analysis-table-wrapper'})
				.append($('<div>', {'class': 'd2t-landing-go-back'})
					.html('<< Go Back'))
				.append($('<div>', {'class': 'd2t-landing-tool-info'})
				.append($('<img>', {'class': 'd2t-landing-tool-info-icon', 'src': toolData['tool_icon_url']}))
				.append($('<div>', {'class': 'd2t-landing-tool-info-text'})
					.append($('<div>', {'class': 'd2t-landing-tool-info-title'}).
						html(toolName))
					.append($('<div>', {'class': 'd2t-landing-tool-info-description'})
						.html(toolData['tool_description'])))));

			// Table header
			$analysisTables.find('#'+toolName+'-wrapper')
				.append($('<div>', {'id': toolName+'-table-wrapper', 'class': 'd2t-individual-table-wrapper'}).html(
					$('<table>', {'id': toolName+'-table','class': 'd2t-analysis-table d2t-datatable'})
						.append($('<thead>')
							.html($('<tr>')
								.append($('<th>').html('Link'))
								.append($('<th>').html('Description'))
								.append($('<th>').html('Metadata'))))));

			// Table rows
			$.each(toolData['canned_analyses'], function(index, analysisData) {
				$analysisTables.find('#'+toolName+'-table')
					.append($('<tbody>')
						.append($('<tr>')
							.append($('<td>', {'class': 'd2t-link-col'})
								.html($('<a>', {'href': analysisData['canned_analysis_url'], 'target': '_blank'})
									.html($('<img>', {'class': 'd2t-link-icon', 'src': toolData['tool_icon_url']}))))
							.append($('<td>', {'class': 'd2t-description-col'})
								.html($('<span>', {'data-toggle': "d2t-tooltip", 'class':'d2t-analysis-title', 'data-placement': "top", 'data-html': "true", 'data-original-title': "<div class='d2t-canned-analysis-description-tooltip'>"+analysisData['canned_analysis_description']+""})
									.html(analysisData['canned_analysis_title'])))
							.append($('<td>', {'class': 'd2t-metadata-col'})
								.html($('<i>', {'class': 'fa fa-info-circle d2t-metadata-icon', 'data-toggle': "d2t-tooltip", 'data-placement': "top", 'data-html': "true"})))));

				// Row metadata tooltips
				metadataTooltip = $('<div>', {'class': 'd2t-metadata-tooltip'}).html($('<ul>', {'class': 'd2t-metadata-list'}));
				$.each(analysisData['metadata'], function(termName, termValue) {
					metadataTooltip.find('ul').append($('<li>')
						.append($('<span>', {'class': 'd2t-metadata-term'})
							.html(termName+':'))
						.append($('<span>', {'class': 'd2t-metadata-value'})
							.html(termValue)))
				});
				$analysisTables.find('#'+toolName+'-table i').last().attr('data-original-title', metadataTooltip.html())

			});

		});


		// Return
		return $('<div>', {'data-dataset-accession': datasetAccession})
					.append($toolTable)
					.append($analysisTables);
	},

	//////////////////////////////
	///// 3. Add
	//////////////////////////////

	///// Creates and add interfaces

	add: function(parents) {

		// Define self
		var self = this;
		
		// Loop through parents
		$.each(parents, function(datasetAccession, parentDiv) {
			// AJAX request
			$.ajax({
				url: 'https://amp.pharm.mssm.edu/datasets2tools/api/chrome_extension',
				data: {
					'object_type': 'canned_analysis',
					'dataset_accession': datasetAccession
				},
				success: function(data) {

					// Load
					var apiData = JSON.parse(data);

					// Create interfaces
					if (Page.isDataMedSearchResults() || Page.isGeoSearchResults()) {
						analysisInterface = self.createSearchInterface(apiData, datasetAccession);
					} else if (Page.isDataMedLanding() || Page.isGeoSeriesLanding() || Page.isGeoDatasetLanding()) {
						analysisInterface = self.createLandingInterface(apiData, datasetAccession);
					}

					// Add interfaces
					if (Object.keys(apiData).length) {
						Page.addInterface(analysisInterface, parentDiv);
					}

					// Activate tooltips and datatables
					$("[data-dataset-accession='"+datasetAccession+"'] .d2t-datatable").dynatable({});
					$("[data-toggle='d2t-tooltip']").tooltip();

				}
			});
		});

	}
};

//////////////////////////////////////////////////
////////// 3. eventListener //////////////////////
//////////////////////////////////////////////////

///// Event listeners.

var eventListener = {

	clickToolIcon: function() {
		$(document).on('click', '.d2t-tool-icon', function(evt) {
			console.log('asd');
			// Get click info
			datasetAccession = $(evt.target).parents('.d2t-wrapper').attr('data-dataset-accession');
			toolName = $(evt.target).attr('data-tool-name');

			// Hide and show
			$(evt.target).parents('.d2t-toolbar').css('display', 'none');

			$(evt.target).parents('.d2t-wrapper').find('.d2t-tool-info-wrapper').css('display', 'table');
			$(evt.target).parents('.d2t-wrapper').find('#'+datasetAccession+'-'+toolName+'-info').css('display', 'table');

			$(evt.target).parents('.d2t-wrapper').find('.d2t-table-wrapper').show();
			$(evt.target).parents('.d2t-wrapper').find('#'+datasetAccession+'-'+toolName+'-wrapper').show();
		});
	},

	clickBackArrow: function() {
		$(document).on('click', '.d2t-back-arrow', function(evt) {
			// Get click info
			datasetAccession = $(evt.target).parents('.d2t-wrapper').attr('data-dataset-accession');
			toolName = $(evt.target).attr('data-tool-name');

			// Hide and show
			$(evt.target).parents('.d2t-wrapper').find('.d2t-toolbar').css('display', 'table');

			$(evt.target).parents('.d2t-wrapper').find('.d2t-tool-info-wrapper').css('display', 'none');
			$(evt.target).parents('.d2t-wrapper').find('.d2t-tool-info').css('display', 'none');

			$(evt.target).parents('.d2t-wrapper').find('.d2t-table-wrapper').css('display', 'none');
			$(evt.target).parents('.d2t-wrapper').find('.d2t-individual-table-wrapper').css('display', 'none');
		});
	},

	clickExpandIcon: function() {
		$(document).on('click', '.d2t-expand', function(evt) {
			// Get click info
			toolName = $(evt.target).attr('data-tool-name');

			// Hide and show
			$('.d2t-tool-table').hide();
			$('#'+toolName+'-wrapper').show();
			$('#'+toolName+'-table-wrapper').show();

		});
	},

	clickLandingGoBack: function() {
		$(document).on('click', '.d2t-landing-go-back', function(evt) {
			// Get click info
			toolName = $(evt.target).attr('data-tool-name');

			// Hide and show
			$('.d2t-tool-table').show();
			$('#'+toolName+'-wrapper').hide();
			$('#'+toolName+'-table-wrapper').hide();
			$('.d2t-analysis-table-wrapper').hide();

		});
	},

	changeTable: function() {
		$(document).on('click', '.dynatable-page-link', function(evt) {
			// Update tooltip
			$("[data-toggle='d2t-tooltip']").tooltip();
		});
	},

	//////////////////////////////
	///// . main
	//////////////////////////////

	///// Main wrapper.

	main: function() {
		this.clickToolIcon();
		this.clickBackArrow();
		this.clickExpandIcon();
		this.clickLandingGoBack();
		this.changeTable();
	}
};

//////////////////////////////////////////////////////////////////////
///////// 3. Run Main Function ///////////////////////////////////////
//////////////////////////////////////////////////////////////////////
main();
