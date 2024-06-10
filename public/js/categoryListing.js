const filters = document.querySelectorAll('.filter');
filters.forEach(filter => {
    filter.addEventListener('click', () => {
        const category = filter.querySelector('p').textContent;
        window.location.href = `/listings/category?filter=${category}`;
    });
});