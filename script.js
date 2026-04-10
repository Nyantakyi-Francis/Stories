const SITE_TITLE = "Nyantakyi Francis' Story Collection";
const SITE_OWNER = "Nyantakyi Francis";
const PROFILE_URL = "https://nyantakyi-francis.github.io/portfolio/index.html";

function getSiteContext() {
    const isStoryPage = window.location.pathname.includes('/stories/');
    const root = document.body?.dataset.root || (isStoryPage ? '..' : '.');
    const currentPage = document.body?.dataset.page || '';
    const joinPath = (path) => (root === '.' ? path : `${root}/${path}`);

    return {
        currentPage,
        root,
        homeHref: joinPath('index.html'),
        aboutHref: joinPath('about.html'),
        disclaimerHref: joinPath('disclaimer.html'),
        storyTemplateHref: joinPath('stories/story_template.html')
    };
}

function getNavLinkClass(isCurrent) {
    if (isCurrent) {
        return 'nav-link-hover text-white font-semibold border-b-2 border-white pb-1';
    }

    return 'nav-link-hover hover:text-gray-300';
}

function renderSiteChrome() {
    const context = getSiteContext();
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');

    if (sidebar) {
        sidebar.innerHTML = `
            <nav class="p-4">
                <h2 class="text-xl font-bold mb-4 text-gray-200">All Stories</h2>
                <ul class="space-y-2"></ul>
            </nav>
        `;
    }

    if (header) {
        header.innerHTML = `
            <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center">
                <h1 class="text-3xl md:text-4xl font-bold mb-4 sm:mb-0 text-center sm:text-left">${SITE_TITLE}</h1>
                <nav class="space-x-4">
                    <a href="${context.homeHref}" class="${getNavLinkClass(context.currentPage === 'home')}">Home</a>
                    <a href="${context.aboutHref}" class="${getNavLinkClass(context.currentPage === 'about')}">About Me</a>
                </nav>
            </div>
        `;
    }

    if (footer) {
        footer.innerHTML = `
            <div class="container mx-auto text-center text-sm">
                <p>&copy; ${new Date().getFullYear()} ${SITE_OWNER}</p>
                <p>${SITE_TITLE}. All rights reserved. | <a href="${context.disclaimerHref}" class="text-blue-400 hover:text-blue-200 underline">Disclaimer</a></p>
                <p>Look me up <a href="${PROFILE_URL}" class="text-blue-400 hover:text-blue-200 underline">here</a> for us to connect</p>
                <p>Last Modified: <span id="last-modified"></span></p>
            </div>
        `;
    }
}

function setLastModifiedDate() {
    const lastModifiedElement = document.getElementById('last-modified');

    if (!lastModifiedElement) {
        return;
    }

    const lastModified = new Date(document.lastModified);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    lastModifiedElement.textContent = Number.isNaN(lastModified.getTime())
        ? 'Unavailable'
        : lastModified.toLocaleString('en-US', options);
}

function buildStoryLink(storyId) {
    const { storyTemplateHref } = getSiteContext();
    return `${storyTemplateHref}?id=${storyId}`;
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.querySelector('main');

    if (!sidebar || !sidebarToggle || !mainContent) {
        return;
    }

    sidebarToggle.setAttribute('aria-controls', 'sidebar');
    sidebarToggle.setAttribute('aria-expanded', 'false');

    sidebarToggle.addEventListener('click', () => {
        const isExpanded = sidebar.classList.toggle('is-expanded');
        mainContent.classList.toggle('content-shifted', isExpanded);
        sidebarToggle.setAttribute('aria-expanded', String(isExpanded));
    });
}

function setupBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');

    if (!backToTopButton) {
        return;
    }

    window.addEventListener('scroll', () => {
        backToTopButton.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function generateStoryTiles() {
    const storyTilesContainer = document.getElementById('story-tiles-container');

    if (!storyTilesContainer || typeof storiesData === 'undefined') {
        return;
    }

    storyTilesContainer.innerHTML = '';

    storiesData.forEach((story) => {
        const storyCard = document.createElement('a');
        storyCard.href = buildStoryLink(story.id);
        storyCard.className = 'story-tile block';

        const image = document.createElement('img');
        image.src = story.image;
        image.alt = `Image for ${story.title}`;
        image.className = 'w-full h-40 object-cover rounded-t-xl';
        image.loading = 'lazy';

        const content = document.createElement('div');
        content.className = 'p-4';

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-gray-800 mb-2';
        title.textContent = story.title;

        const teaser = document.createElement('p');
        teaser.className = 'text-sm text-gray-600';
        teaser.textContent = story.teaser;

        content.append(title, teaser);
        storyCard.append(image, content);
        storyTilesContainer.appendChild(storyCard);
    });
}

function generateSidebarLinks() {
    const sidebarList = document.querySelector('#sidebar ul');

    if (!sidebarList || typeof storiesData === 'undefined') {
        return;
    }

    sidebarList.innerHTML = '';

    storiesData.forEach((story) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');

        link.href = buildStoryLink(story.id);
        link.className = 'block py-2 px-3 rounded-md hover:bg-gray-700 transition duration-200 ease-in-out text-gray-300';
        link.textContent = story.title;

        listItem.appendChild(link);
        sidebarList.appendChild(listItem);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('story-search');
    const storyTilesContainer = document.getElementById('story-tiles-container');

    if (!searchInput || !storyTilesContainer) {
        return;
    }

    const emptyState = document.createElement('p');
    emptyState.className = 'text-center text-gray-600 mt-6 hidden';
    emptyState.textContent = 'No stories matched your search yet.';
    storyTilesContainer.insertAdjacentElement('afterend', emptyState);

    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.trim().toLowerCase();
        const storyTiles = storyTilesContainer.querySelectorAll('.story-tile');
        let visibleStories = 0;

        storyTiles.forEach((tile) => {
            const titleText = tile.querySelector('h3')?.textContent.toLowerCase() || '';
            const teaserText = tile.querySelector('p')?.textContent.toLowerCase() || '';
            const matches = titleText.includes(searchTerm) || teaserText.includes(searchTerm);

            tile.style.display = matches ? '' : 'none';

            if (matches) {
                visibleStories += 1;
            }
        });

        emptyState.classList.toggle('hidden', visibleStories > 0);
    });
}

function loadStoryContent() {
    const storyContentDiv = document.getElementById('story-content');
    const { homeHref } = getSiteContext();

    if (!storyContentDiv) {
        return;
    }

    if (typeof fullStoriesContent === 'undefined') {
        storyContentDiv.innerHTML = `
            <h2 class="text-3xl md:text-4xl font-bold text-red-600 mb-8 text-center">Story Unavailable</h2>
            <p class="text-center text-lg">The story content could not be loaded. Please return to the <a href="${homeHref}" class="text-blue-600 hover:underline">homepage</a>.</p>
        `;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const storyId = Number.parseInt(urlParams.get('id'), 10);

    if (storyId && fullStoriesContent[storyId]) {
        storyContentDiv.innerHTML = fullStoriesContent[storyId];
        const story = typeof storiesData !== 'undefined'
            ? storiesData.find((candidate) => candidate.id === storyId)
            : null;

        if (story) {
            document.title = `${story.title} - ${SITE_TITLE}`;
        }

        return;
    }

    storyContentDiv.innerHTML = `
        <h2 class="text-3xl md:text-4xl font-bold text-red-600 mb-8 text-center">Story Not Found</h2>
        <p class="text-center text-lg">Please return to the <a href="${homeHref}" class="text-blue-600 hover:underline">homepage</a> to select a valid story.</p>
    `;
    document.title = 'Story Not Found';
}

function setupReadAloud() {
    const readAloudButton = document.getElementById('read-aloud-toggle');
    const storyContentDiv = document.getElementById('story-content');

    if (!readAloudButton || !storyContentDiv) {
        return;
    }

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        readAloudButton.disabled = true;
        readAloudButton.textContent = 'Read Aloud Unavailable';
        readAloudButton.classList.add('opacity-60', 'cursor-not-allowed');
        return;
    }

    let readingState = 'idle';
    let utterance;

    const resetReadAloud = () => {
        readingState = 'idle';
        readAloudButton.textContent = 'Read Aloud';
    };

    readAloudButton.addEventListener('click', () => {
        if (readingState === 'idle') {
            const text = storyContentDiv.textContent.trim();

            if (!text) {
                return;
            }

            speechSynthesis.cancel();
            utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.lang = document.documentElement.lang || 'en-US';
            utterance.onend = resetReadAloud;
            utterance.onerror = resetReadAloud;

            speechSynthesis.speak(utterance);
            readingState = 'reading';
            readAloudButton.textContent = 'Pause';
            return;
        }

        if (readingState === 'reading') {
            speechSynthesis.pause();
            readingState = 'paused';
            readAloudButton.textContent = 'Resume';
            return;
        }

        speechSynthesis.resume();
        readingState = 'reading';
        readAloudButton.textContent = 'Pause';
    });

    window.addEventListener('beforeunload', () => {
        speechSynthesis.cancel();
    });
}

function initSite() {
    renderSiteChrome();
    setLastModifiedDate();
    setupSidebarToggle();
    setupBackToTop();
    generateSidebarLinks();

    if (document.getElementById('story-tiles-container')) {
        generateStoryTiles();
        setupSearch();
    }

    if (document.getElementById('story-content')) {
        loadStoryContent();
        setupReadAloud();
    }
}

document.addEventListener('DOMContentLoaded', initSite);
