using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Trippin.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedWorldwideDestinations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 2,
                column: "BestTimeToVisit",
                value: "March–May, Oct–Nov");

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 3,
                column: "BestTimeToVisit",
                value: "June–Sep, Dec–Mar");

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 4,
                column: "BestTimeToVisit",
                value: "April–June, Sep–Oct");

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 5,
                column: "BestTimeToVisit",
                value: "Year-round");

            migrationBuilder.InsertData(
                table: "Destinations",
                columns: new[] { "Id", "AverageCostPerDay", "BestTimeToVisit", "Category", "City", "Country", "CreatedAt", "Currency", "Description", "Highlights", "ImageUrl", "IsDeleted", "IsPopular", "Latitude", "Longitude", "Name", "Tags", "ThumbnailUrl" },
                values: new object[,]
                {
                    { 7, 60m, "April–October", "beach", "Ubud", "Indonesia", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Terraced rice paddies, sacred temples, and surf beaches.", "Uluwatu Temple|Tegallalang Rice Terrace|Seminyak Beach", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200", false, true, -8.3405000000000005, 115.092, "Bali", "surfing,temples,rice-terraces", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" },
                    { 8, 55m, "November–March", "beach", "Phuket", "Thailand", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Turquoise Andaman Sea, limestone karsts, and Thai street food.", "Phi Phi Islands|Patong Beach|Big Buddha", "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200", false, true, 7.8803999999999998, 98.392300000000006, "Phuket", "islands,nightlife,food", "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400" },
                    { 9, 220m, "May–September", "beach", "Positano", "Italy", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Pastel cliffside villages cascading into the Mediterranean.", "Path of the Gods|Ravello Gardens|Limoncello tasting", "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1200", false, false, 40.633299999999998, 14.6029, "Amalfi Coast", "coastline,food,romance", "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400" },
                    { 10, 120m, "December–April", "beach", "Cancún", "Mexico", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Caribbean beaches, Mayan ruins, and cenote swimming.", "Chichén Itzá|Isla Mujeres|Cenote Ik Kil", "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1200", false, true, 21.161899999999999, -86.851500000000001, "Cancún", "ruins,cenotes,nightlife", "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400" },
                    { 11, 80m, "June–October", "beach", "Stone Town", "Tanzania", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Spice island with white sand, coral reefs, and historic Stone Town.", "Stone Town|Nungwi Beach|Spice tour", "https://images.unsplash.com/photo-1586861203927-800a5acdcc4e?w=1200", false, false, -6.1658999999999997, 39.202599999999997, "Zanzibar", "spices,snorkeling,history", "https://images.unsplash.com/photo-1586861203927-800a5acdcc4e?w=400" },
                    { 12, 250m, "April–May, Sep–Nov", "beach", "Lahaina", "United States", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Volcanic craters, whale watching, and the Road to Hana.", "Haleakalā Sunrise|Road to Hana|Molokini Snorkeling", "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1200", false, false, 20.798400000000001, -156.33189999999999, "Maui", "volcanoes,surfing,whales", "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=400" },
                    { 13, 300m, "April–May, Oct–Nov", "beach", "Mahé", "Seychelles", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Granite boulders, giant tortoises, and pristine Indian Ocean coves.", "Anse Source d'Argent|Vallée de Mai|Giant tortoises", "https://images.unsplash.com/photo-1589979481223-deb893043163?w=1200", false, false, -4.6795999999999998, 55.491999999999997, "Seychelles", "luxury,nature,snorkeling", "https://images.unsplash.com/photo-1589979481223-deb893043163?w=400" },
                    { 14, 130m, "March–May, Oct–Nov", "city", "Tokyo", "Japan", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Neon-lit metropolis blending ultramodern and traditional.", "Shibuya Crossing|Senso-ji Temple|Tsukiji Market", "https://images.unsplash.com/photo-1540959733332-eab8343a890d?w=1200", false, true, 35.676200000000001, 139.65029999999999, "Tokyo", "food,technology,anime", "https://images.unsplash.com/photo-1540959733332-eab8343a890d?w=400" },
                    { 15, 200m, "April–June, Sep–Oct", "city", "Paris", "France", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "The City of Light — art, fashion, cuisine, and the Eiffel Tower.", "Eiffel Tower|Louvre Museum|Montmartre", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200", false, true, 48.8566, 2.3521999999999998, "Paris", "art,food,romance", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
                    { 16, 280m, "April–June, Sep–Nov", "city", "New York", "United States", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "The city that never sleeps — Broadway, Central Park, and pizza.", "Central Park|Times Square|Statue of Liberty", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200", false, true, 40.712800000000001, -74.006, "New York", "broadway,food,shopping", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400" },
                    { 17, 200m, "November–March", "city", "Dubai", "United Arab Emirates", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Futuristic skyline, desert safaris, and luxury shopping.", "Burj Khalifa|Dubai Mall|Desert safari", "https://images.unsplash.com/photo-1512453913507-d187c340770a?w=1200", false, true, 25.204799999999999, 55.270800000000001, "Dubai", "luxury,shopping,desert", "https://images.unsplash.com/photo-1512453913507-d187c340770a?w=400" },
                    { 18, 220m, "May–September", "city", "London", "United Kingdom", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Royal palaces, world-class museums, and afternoon tea.", "Tower of London|British Museum|West End", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200", false, false, 51.507399999999997, -0.1278, "London", "history,theatre,pubs", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400" },
                    { 19, 180m, "February–April", "city", "Singapore", "Singapore", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Garden city-state with hawker food, Marina Bay, and Sentosa.", "Marina Bay Sands|Gardens by the Bay|Hawker centres", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200", false, false, 1.3521000000000001, 103.8198, "Singapore", "food,gardens,clean", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400" },
                    { 20, 70m, "April–May, Sep–Nov", "city", "Istanbul", "Turkey", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Where East meets West — bazaars, mosques, and Bosphorus cruises.", "Hagia Sophia|Grand Bazaar|Bosphorus cruise", "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200", false, false, 41.008200000000002, 28.978400000000001, "Istanbul", "history,bazaars,food", "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400" },
                    { 21, 160m, "April–June, Sep–Oct", "city", "Rome", "Italy", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Eternal City of emperors — Colosseum, Vatican, and gelato.", "Colosseum|Vatican Museums|Trevi Fountain", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200", false, false, 41.902799999999999, 12.4964, "Rome", "history,food,art", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
                    { 22, 190m, "September–November", "city", "Sydney", "Australia", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Harbour icons, golden beaches, and laid-back Aussie culture.", "Sydney Opera House|Bondi Beach|Harbour Bridge", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200", false, false, -33.8688, 151.20930000000001, "Sydney", "beaches,opera,surfing", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
                    { 23, 40m, "October–March", "city", "Mumbai", "India", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Bollywood, street food, colonial grandeur, and the Arabian Sea.", "Gateway of India|Marine Drive|Dharavi tour", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200", false, false, 19.076000000000001, 72.877700000000004, "Mumbai", "food,bollywood,history", "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400" },
                    { 24, 170m, "October–December", "city", "Hong Kong", "China", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Dizzying skyline, dim sum, and Victoria Peak views.", "Victoria Peak|Star Ferry|Temple Street Market", "https://images.unsplash.com/photo-1536599018102-9f803c029b22?w=1200", false, false, 22.319299999999998, 114.1694, "Hong Kong", "food,skyline,shopping", "https://images.unsplash.com/photo-1536599018102-9f803c029b22?w=400" },
                    { 25, 60m, "March–May, Sep–Nov", "cultural", "Marrakech", "Morocco", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Medina souks, riads, and the Atlas Mountains backdrop.", "Jemaa el-Fnaa|Majorelle Garden|Atlas Mountains", "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200", false, false, 31.6295, -7.9810999999999996, "Marrakech", "souks,riads,spices", "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400" },
                    { 26, 50m, "May–September", "cultural", "Cusco", "Peru", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Gateway to Machu Picchu and Inca heritage in the Andes.", "Machu Picchu|Sacred Valley|Rainbow Mountain", "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200", false, false, -13.532, -71.967500000000001, "Cusco", "ruins,andes,history", "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400" },
                    { 27, 25m, "October–March", "cultural", "Varanasi", "India", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "India's spiritual heart — Ganges ghats and ancient rituals.", "Ganga Aarti|Dashashwamedh Ghat|Sarnath", "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200", false, false, 25.317599999999999, 82.9739, "Varanasi", "spiritual,ganges,temples", "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400" },
                    { 28, 45m, "October–April", "cultural", "Cairo", "Egypt", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Pyramids, pharaohs, and the mighty Nile.", "Great Pyramids|Egyptian Museum|Khan el-Khalili", "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200", false, false, 30.0444, 31.235700000000001, "Cairo", "pyramids,history,nile", "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400" },
                    { 29, 80m, "March–May, Sep–Nov", "cultural", "Wadi Musa", "Jordan", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Rose-red city carved into desert cliffs by the Nabataeans.", "The Treasury|The Monastery|Siq canyon", "https://images.unsplash.com/photo-1579606032821-4e6161c81c86?w=1200", false, false, 30.328499999999998, 35.444400000000002, "Petra", "archaeology,desert,hiking", "https://images.unsplash.com/photo-1579606032821-4e6161c81c86?w=400" },
                    { 30, 30m, "November–March", "cultural", "Siem Reap", "Cambodia", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Ancient Angkor temples rising from tropical jungle.", "Angkor Wat|Bayon Temple|Ta Prohm", "https://images.unsplash.com/photo-1600000418916-3ef26d36c01b?w=1200", false, false, 13.367100000000001, 103.84480000000001, "Siem Reap", "temples,jungle,history", "https://images.unsplash.com/photo-1600000418916-3ef26d36c01b?w=400" },
                    { 31, 100m, "April–June, Sep–Oct", "cultural", "Athens", "Greece", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Birthplace of democracy with the Acropolis watching over.", "Acropolis|Plaka|Ancient Agora", "https://images.unsplash.com/photo-1555993539-1b2e5c58e0d7?w=1200", false, false, 37.983800000000002, 23.727499999999999, "Athens", "acropolis,philosophy,food", "https://images.unsplash.com/photo-1555993539-1b2e5c58e0d7?w=400" },
                    { 32, 300m, "June–Sep, Dec–Mar", "mountains", "Interlaken", "Switzerland", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Snow-capped peaks, chocolate, and precision railways.", "Jungfrau|Lauterbrunnen Valley|Glacier Express", "https://images.unsplash.com/photo-1530122037265-83aee0480052?w=1200", false, true, 46.686300000000003, 7.8632, "Swiss Alps", "skiing,trains,chocolate", "https://images.unsplash.com/photo-1530122037265-83aee0480052?w=400" },
                    { 33, 120m, "October–March", "mountains", "El Chaltén", "Argentina", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Raw wilderness of glaciers, granite spires, and steppe.", "Perito Moreno Glacier|Torres del Paine|Fitz Roy", "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200", false, false, -49.331499999999998, -72.885999999999996, "Patagonia", "trekking,glaciers,wildlife", "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400" },
                    { 34, 40m, "June–September", "mountains", "Leh", "India", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "High-altitude desert with monasteries and Pangong Lake.", "Pangong Lake|Nubra Valley|Khardung La", "https://images.unsplash.com/photo-1544735716-ea9ef0a14fb4?w=1200", false, false, 34.1526, 77.577100000000002, "Leh-Ladakh", "monasteries,passes,lakes", "https://images.unsplash.com/photo-1544735716-ea9ef0a14fb4?w=400" },
                    { 35, 180m, "June–Sep, Dec–Mar", "mountains", "Cortina", "Italy", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Dramatic pink-hued peaks and alpine meadows in northern Italy.", "Tre Cime|Seceda|Lago di Braies", "https://images.unsplash.com/photo-1501854140801-ce89f857b5b7?w=1200", false, false, 46.410200000000003, 11.844099999999999, "Dolomites", "via-ferrata,skiing,hiking", "https://images.unsplash.com/photo-1501854140801-ce89f857b5b7?w=400" },
                    { 36, 220m, "June–Aug, Sep–Mar for aurora", "adventure", "Reykjavik", "Iceland", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Fire and ice — volcanoes, glaciers, geysers, and northern lights.", "Golden Circle|Blue Lagoon|Northern Lights", "https://images.unsplash.com/photo-1504829857797-deb22ed9158a?w=1200", false, true, 64.146600000000007, -21.942599999999999, "Iceland", "aurora,glaciers,geysers", "https://images.unsplash.com/photo-1504829857797-deb22ed9158a?w=400" },
                    { 37, 90m, "December–April", "adventure", "La Fortuna", "Costa Rica", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Rainforests, zip-lines, sloths, and Pacific surf.", "Arenal Volcano|Monteverde|Manuel Antonio", "https://images.unsplash.com/photo-1518259102261-b40117eabbc8?w=1200", false, false, 10.469900000000001, -84.642700000000005, "Costa Rica", "wildlife,rainforest,surfing", "https://images.unsplash.com/photo-1518259102261-b40117eabbc8?w=400" },
                    { 38, 150m, "May–September", "adventure", "Kruger", "South Africa", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Big Five safaris on the African savanna.", "Big Five game drives|Panorama Route|Bush walks", "https://images.unsplash.com/photo-1516426122078-f30e1c35ee33?w=1200", false, false, -24.011299999999999, 31.485399999999998, "Kruger", "safari,wildlife,big-five", "https://images.unsplash.com/photo-1516426122078-f30e1c35ee33?w=400" },
                    { 39, 250m, "June–November", "adventure", "Puerto Ayora", "Ecuador", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Darwin's living laboratory — giant tortoises and marine iguanas.", "Giant tortoises|Blue-footed boobies|Snorkeling", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", false, false, -0.74319999999999997, -90.303799999999995, "Galápagos", "wildlife,diving,endemic", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400" },
                    { 40, 35m, "Oct–Nov, Mar–May", "adventure", "Kathmandu", "Nepal", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Himalayan trekking, Everest Base Camp, and Buddhist serenity.", "Everest Base Camp|Annapurna Circuit|Boudhanath", "https://images.unsplash.com/photo-1544735716-392fe2489fcd?w=1200", false, false, 27.717199999999998, 85.323999999999998, "Nepal", "trekking,everest,temples", "https://images.unsplash.com/photo-1544735716-392fe2489fcd?w=400" },
                    { 41, 230m, "May–September", "nature", "Bergen", "Norway", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Dramatic sea-carved valleys and midnight sun.", "Geirangerfjord|Trolltunga|Flåm Railway", "https://images.unsplash.com/photo-1507272931001-fc06c17866f4?w=1200", false, false, 60.391300000000001, 5.3220999999999998, "Norwegian Fjords", "fjords,midnight-sun,hiking", "https://images.unsplash.com/photo-1507272931001-fc06c17866f4?w=400" },
                    { 42, 200m, "June–October", "nature", "Cairns", "Australia", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "World's largest coral reef teeming with marine life.", "Outer reef diving|Whitehaven Beach|Glass-bottom boat", "https://images.unsplash.com/photo-1582967788606-a171c7e0f7fc?w=1200", false, false, -16.918600000000001, 145.77809999999999, "Great Barrier Reef", "diving,coral,marine", "https://images.unsplash.com/photo-1582967788606-a171c7e0f7fc?w=400" },
                    { 43, 70m, "April–June, Sep–Nov", "nature", "Göreme", "Turkey", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Fairy chimneys, cave hotels, and hot-air balloon sunrises.", "Hot-air balloons|Underground cities|Göreme Open-Air Museum", "https://images.unsplash.com/photo-1526048598645-62b7c9ee6c7d?w=1200", false, true, 38.643099999999997, 34.828699999999998, "Cappadocia", "balloons,caves,history", "https://images.unsplash.com/photo-1526048598645-62b7c9ee6c7d?w=400" },
                    { 44, 100m, "June–November", "nature", "Manaus", "Brazil", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Earth's greatest rainforest — pink dolphins and canopy walks.", "Canopy walk|Pink river dolphins|Indigenous villages", "https://images.unsplash.com/photo-1596587483932-df0c1e6c3a31?w=1200", false, false, -3.1190000000000002, -60.021700000000003, "Amazon", "jungle,wildlife,river", "https://images.unsplash.com/photo-1596587483932-df0c1e6c3a31?w=400" },
                    { 45, 150m, "May–September", "nature", "West Yellowstone", "United States", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Geysers, bison herds, and prismatic hot springs.", "Old Faithful|Grand Prismatic Spring|Lamar Valley", "https://images.unsplash.com/photo-1529439322271-42e2b71b9ec0?w=1200", false, false, 44.427999999999997, -110.5885, "Yellowstone", "geysers,wildlife,national-park", "https://images.unsplash.com/photo-1529439322271-42e2b71b9ec0?w=400" },
                    { 46, 100m, "March–October", "city", "Lisbon", "Portugal", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Pastel-tiled hills, tram 28, and pastéis de nata.", "Belém Tower|Alfama|Time Out Market", "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200", false, false, 38.722299999999997, -9.1393000000000004, "Lisbon", "food,trams,tiles", "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400" },
                    { 47, 80m, "April–June, Sep–Oct", "city", "Prague", "Czech Republic", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Gothic spires, Charles Bridge, and affordable beer.", "Charles Bridge|Old Town Square|Prague Castle", "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200", false, false, 50.075499999999998, 14.437799999999999, "Prague", "beer,architecture,history", "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400" },
                    { 48, 100m, "November–April", "beach", "Tulum", "Mexico", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Bohemian beach town with Mayan clifftop ruins.", "Tulum Ruins|Gran Cenote|Sian Ka'an Biosphere", "https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=1200", false, false, 20.211400000000001, -87.465400000000002, "Tulum", "ruins,cenotes,yoga", "https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=400" },
                    { 49, 35m, "October–March", "cultural", "Jaipur", "India", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "The Pink City — forts, palaces, and Rajasthani colour.", "Amber Fort|Hawa Mahal|City Palace", "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200", false, false, 26.912400000000002, 75.787300000000002, "Jaipur", "forts,palaces,textiles", "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400" },
                    { 50, 130m, "May–September", "city", "Dubrovnik", "Croatia", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "USD", "Walled Old Town on the Adriatic — the real King's Landing.", "City Walls walk|Lokrum Island|Cable car", "https://images.unsplash.com/photo-1555990793-da11153b2473?w=1200", false, false, 42.650700000000001, 18.0944, "Dubrovnik", "walls,adriatic,history", "https://images.unsplash.com/photo-1555990793-da11153b2473?w=400" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 2,
                column: "BestTimeToVisit",
                value: "March–May, October–November");

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 3,
                column: "BestTimeToVisit",
                value: "June–September, December–March");

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 4,
                column: "BestTimeToVisit",
                value: "April–June, September–October");

            migrationBuilder.UpdateData(
                table: "Destinations",
                keyColumn: "Id",
                keyValue: 5,
                column: "BestTimeToVisit",
                value: "Year-round by activity");
        }
    }
}
