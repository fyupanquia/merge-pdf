const merge = require('easy-pdf-merge');
const https = require('https');
const http = require('http');
const fs = require('fs');


async function download(url, filePath) {
	const proto = !url.charAt(4).localeCompare('s') ? https : http;

	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(filePath);
		let fileInfo = null;

		const request = proto.get(url, response => {
			if (response.statusCode !== 200) {
				reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
				return;
			}

			fileInfo = {
				mime: response.headers['content-type'],
				size: parseInt(response.headers['content-length'], 10),
			};

			response.pipe(file);
		});

		// The destination stream is ended by the time it's called
		file.on('finish', () => resolve(filePath));

		request.on('error', err => {
			fs.unlink(filePath, () => reject(err));
		});

		file.on('error', err => {
			fs.unlink(filePath, () => reject(err));
		});

		request.end();
	});
}

async function mergeFiles() {
	const dir = './files'
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	const file1 = await download('https://images.template.net/wp-content/uploads/2016/04/11070051/Format-of-Music-Sheet-Template-for-Hello-Free-Download.pdf', `${dir}/hello.pdf`)
	const file2 = await download('https://www.partituras-para.com/download/321/?v=328', `${dir}/godfather.pdf`)

	merge([file1, file2], `${dir}/hello-godfather.pdf`, function (err) {
		if (err) {
			return console.log(err)
		}
		console.log('Successfully merged!')
	});
};

mergeFiles();
