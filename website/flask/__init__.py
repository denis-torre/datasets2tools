# Modules
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import pandas as pd
import os, json, random
from sqlalchemy.exc import IntegrityError

# Configure
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:MyNewPass@localhost/datasets2tools'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'Thisissupposedtobesecret!'
db = SQLAlchemy(app)
engine = db.engine
entry_point = '/datasets2tools'

# Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(15), unique=True)
	email = db.Column(db.String(50), unique=True)
	password = db.Column(db.String(80))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route(entry_point+'/login', methods=['POST'])
def login():
	login_data = request.form.to_dict()
	user = User.query.filter_by(email=login_data['email']).first()
	if user:
		if check_password_hash(user.password, login_data['password']):
			login_user(user, remember=False)
			return redirect(url_for('index'))
		else:
			flash('Sorry, wrong username or password. Please try again.', 'login-error')
			return redirect(url_for('index', login="true"))
	else:
		flash('Sorry, wrong username or password. Please try again.', 'login-error')
		return redirect(url_for('index', login="true"))

@app.route(entry_point+'/signup', methods=['POST'])
def signup():
	signup_data = request.form.to_dict()
	signup_data['password'] = generate_password_hash(signup_data['password'], method='sha256')
	new_user = User(username=signup_data['username'], email=signup_data['email'], password=signup_data['password'])
	try:
		db.session.add(new_user)
		db.session.commit()
		login_user(new_user, remember=False)
		return redirect(url_for('index'))
	except IntegrityError as e:
		db.session.rollback()
		duplicate_field = e.message.split("'")[-2].title()
		flash('{duplicate_field} already exists. Please try another.'.format(**locals()), 'signup-error')
		return redirect(url_for('index', signup="true"))

@app.route(entry_point+'/logout')
@login_required
def logout():
	logout_user()
	return redirect(url_for('index'))

# Routes
@app.route(entry_point)
def index():
	return render_template('index.html')

@app.route(entry_point+'/dataset')
def dataset_landing():
	dataset = {
		'dataset_accession': 'GSE68203',
		'dataset_type': 'RNA-seq',
		'dataset_title': 'Genome-wide RNA Pol II-CTD occupancy in wild type and mutant worms',
		'dataset_description': 'We used RNA Pol II-CTD occupancy assay to identify mRNA isoform switch in mutant animals compared to wild type animals.',
		'repository_name': 'Gene Expression Omnibus',
		'repository_icon_url': 'https://www.ncbi.nlm.nih.gov/geo/img/geo_main.gif',
		'repository_homepage_url': 'https://www.ncbi.nlm.nih.gov/geo/',
		'date': 'May 27th, 2017'
	}
	canned_analysis_list = [
		{
			'canned_analysis_preview_url': 'https://github.com/denis-torre/images/blob/master/genemania/1.png?raw=true',
			'canned_analysis_title': 'Enrichment analysis of genes upregulated in cancer',
			'tools': [
				{
					'tool_name': 'GeneMANIA',
					'tool_icon_url': 'https://pbs.twimg.com/profile_images/720745173970460672/psYcEwIT_400x400.jpg'
				},
				{
					'tool_name': 'Enrichr',
					'tool_icon_url': 'http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png'
				},
				{
					'tool_name': 'L1000CDS2',
					'tool_icon_url': 'http://amp.pharm.mssm.edu/L1000CDS2/CSS/images/sigine.png'
				}],
			'datasets': [
				{
					'dataset_accession': 'GSE68203',
					'repository_icon_url': 'https://www.ncbi.nlm.nih.gov/geo/img/geo_main.gif'
				},
				{
					'dataset_accession': 'GSE68205',
					'repository_icon_url': 'https://www.ncbi.nlm.nih.gov/geo/img/geo_main.gif'
				},
				{
					'dataset_accession': 'GSE68209',
					'repository_icon_url': 'https://www.ncbi.nlm.nih.gov/geo/img/geo_main.gif'
				}
			],
			'metadata': {
				'alpha': 'beta',
				'gamma': 'delta',
				'epsilon': 'zeta'
			}
		}
	]

	tool_list = [
		{
			'tool_name': 'Enrichr',
			'tool_icon_url': 'http://amp.pharm.mssm.edu/Enrichr/images/enrichr-icon.png',
			'tool_description': 'An enrichment analysis tool with over 90 libraries.',
			'has_scripts': True
		}
	]
	fairness_dataframe = pd.DataFrame([[1, 'The tool is hosted in one or more well-used repositories, if relevant repositories exist.', "{:0.1f}%".format(random.uniform(0,1)*100)],[2, 'Source code is shared on a public repository.', "{:0.1f}%".format(random.uniform(0,1)*100)],[3, 'Code is written in an open-source, free programming language.', "{:0.1f}%".format(random.uniform(0,1)*100)],[4, 'The tool inputs standard data format(s) consistent with community practice.', "{:0.1f}%".format(random.uniform(0,1)*100)],[5, 'All previous versions of the tool are made available.', "{:0.1f}%".format(random.uniform(0,1)*100)],[6, 'Web-based version is available (in addition to desktop version).', "{:0.1f}%".format(random.uniform(0,1)*100)],[7, 'Source code is documented.', "{:0.1f}%".format(random.uniform(0,1)*100)],[8, 'Pipelines that use the tool have been standardized and provide detailed usage guidelines.', "{:0.1f}%".format(random.uniform(0,1)*100)],[9, 'A tutorial page is provided for the tool.', "{:0.1f}%".format(random.uniform(0,1)*100)],[10, 'Example datasets are provided.', "{:0.1f}%".format(random.uniform(0,1)*100)],[11, 'Licensing information is provided on the tool\'s landing page.', "{:0.1f}%".format(random.uniform(0,1)*100)],[12, 'Information is provided describing how to cite the tool.', "{:0.1f}%".format(random.uniform(0,1)*100)],[13, 'Version information is provided for the tool.', "{:0.1f}%".format(random.uniform(0,1)*100)],[14, 'A paper about the tool has been published.', "{:0.1f}%".format(random.uniform(0,1)*100)],[15, 'Video tutorials for the tool are available.', "{:0.1f}%".format(random.uniform(0,1)*100)],[16, 'Contact information is provided for the originator(s) of the tool.', "{:0.1f}%".format(random.uniform(0,1)*100)]],columns=['#', 'FAIRness Question', 'Score'])
	return render_template('dataset_landing.html', dataset=dataset, canned_analysis_list=canned_analysis_list, tool_list=tool_list, fairness_dataframe=fairness_dataframe)


if __name__ == "__main__":
	app.run(debug=True, host='0.0.0.0')