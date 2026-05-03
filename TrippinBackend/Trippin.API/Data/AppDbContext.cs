using Microsoft.EntityFrameworkCore;
using Trippin.API.Models;

namespace Trippin.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<TripDestination> TripDestinations => Set<TripDestination>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Itinerary> Itineraries => Set<Itinerary>();
    public DbSet<ItineraryItem> ItineraryItems => Set<ItineraryItem>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Name).HasMaxLength(100);
            e.Property(u => u.Email).HasMaxLength(200);
            e.Property(u => u.Role).HasMaxLength(20);
            e.Property(u => u.Country).HasMaxLength(100);
            e.HasQueryFilter(u => !u.IsDeleted);
        });

        modelBuilder.Entity<Destination>(e =>
        {
            e.Property(d => d.AverageCostPerDay).HasPrecision(10, 2);
            e.HasQueryFilter(d => !d.IsDeleted);
        });

        modelBuilder.Entity<Trip>(e =>
        {
            e.Property(t => t.Title).HasMaxLength(200);
            e.Property(t => t.Budget).HasPrecision(12, 2);
            e.HasOne(t => t.User).WithMany(u => u.Trips).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(t => !t.IsDeleted && !t.User.IsDeleted);
        });

        modelBuilder.Entity<TripDestination>(e =>
        {
            e.HasIndex(td => new { td.TripId, td.DestinationId }).IsUnique();
            e.HasOne(td => td.Trip).WithMany(t => t.TripDestinations).HasForeignKey(td => td.TripId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(td => td.Destination).WithMany(d => d.TripDestinations).HasForeignKey(td => td.DestinationId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(td => !td.Trip.IsDeleted && !td.Destination.IsDeleted);
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.Property(b => b.Title).HasMaxLength(200);
            e.Property(b => b.TotalPrice).HasPrecision(12, 2);
            e.HasOne(b => b.User).WithMany(u => u.Bookings).HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.Trip).WithMany(t => t.Bookings).HasForeignKey(b => b.TripId).OnDelete(DeleteBehavior.Cascade);
            e.HasQueryFilter(b => !b.IsDeleted && !b.Trip.IsDeleted && !b.User.IsDeleted);
        });

        modelBuilder.Entity<Itinerary>(e =>
        {
            e.HasOne(i => i.User).WithMany(u => u.Itineraries).HasForeignKey(i => i.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Trip).WithMany(t => t.Itineraries).HasForeignKey(i => i.TripId).OnDelete(DeleteBehavior.Cascade);
            e.HasQueryFilter(i => !i.Trip.IsDeleted && !i.User.IsDeleted);
        });

        modelBuilder.Entity<ItineraryItem>(e =>
        {
            e.Property(ii => ii.EstimatedCost).HasPrecision(10, 2);
            e.HasOne(ii => ii.Itinerary).WithMany(i => i.Items).HasForeignKey(ii => ii.ItineraryId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ii => ii.Destination).WithMany(d => d.ItineraryItems).HasForeignKey(ii => ii.DestinationId).OnDelete(DeleteBehavior.SetNull);
            e.HasQueryFilter(ii => ii.DestinationId == null || !ii.Destination!.IsDeleted);
        });

        modelBuilder.Entity<Review>(e =>
        {
            e.Property(r => r.Title).HasMaxLength(200);
            e.Property(r => r.Content).HasMaxLength(2000);
            e.HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Destination).WithMany(d => d.Reviews).HasForeignKey(r => r.DestinationId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(r => !r.IsDeleted && !r.User.IsDeleted && !r.Destination.IsDeleted);
        });

        SeedData(modelBuilder);
    }

    static void SeedData(ModelBuilder modelBuilder)
    {
        var t = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        Destination D(int id, string name, string country, string city, string desc, string cat, string img, double lat, double lng, decimal cost, string tags, string highlights, string best, bool pop = false)
            => new() { Id=id,Name=name,Country=country,City=city,Description=desc,Category=cat,ImageUrl=$"https://images.unsplash.com/photo-{img}?w=1200",ThumbnailUrl=$"https://images.unsplash.com/photo-{img}?w=400",Latitude=lat,Longitude=lng,AverageCostPerDay=cost,Tags=tags,Highlights=highlights,BestTimeToVisit=best,IsPopular=pop,CreatedAt=t };

        modelBuilder.Entity<Destination>().HasData(
            // ── Beach ──
            D(1,"Santorini","Greece","Oia","Iconic whitewashed villages, caldera sunsets, and Aegean charm.","beach","1613395877344-13d4c79d428e",36.4619,25.3758,180,"islands,sunset,wine","Caldera views|Sunset in Oia|Volcanic beaches","April–October",true),
            D(6,"Maldives","Maldives","Malé Atolls","Overwater villas and crystal-clear Indian Ocean lagoons.","beach","1514282401047-d79a71a590e8",3.2028,73.2207,350,"luxury,diving,relaxation","House reef snorkeling|Sunset dhoni|Spa rituals","November–April",true),
            D(7,"Bali","Indonesia","Ubud","Terraced rice paddies, sacred temples, and surf beaches.","beach","1537996194471-e657df975ab4",  -8.3405,115.092,60,"surfing,temples,rice-terraces","Uluwatu Temple|Tegallalang Rice Terrace|Seminyak Beach","April–October",true),
            D(8,"Phuket","Thailand","Phuket","Turquoise Andaman Sea, limestone karsts, and Thai street food.","beach","1589394815804-964ed0be2eb5"  ,7.8804,98.3923,55,"islands,nightlife,food","Phi Phi Islands|Patong Beach|Big Buddha","November–March",true),
            D(9,"Amalfi Coast","Italy","Positano","Pastel cliffside villages cascading into the Mediterranean.","beach","1534308983496-4fabb1a015ee",40.6333,14.6029,220,"coastline,food,romance","Path of the Gods|Ravello Gardens|Limoncello tasting","May–September"),
            D(10,"Cancún","Mexico","Cancún","Caribbean beaches, Mayan ruins, and cenote swimming.","beach","1552074284-5e88ef1aef18",21.1619,-86.8515,120,"ruins,cenotes,nightlife","Chichén Itzá|Isla Mujeres|Cenote Ik Kil","December–April",true),
            D(11,"Zanzibar","Tanzania","Stone Town","Spice island with white sand, coral reefs, and historic Stone Town.","beach","1586861203927-800a5acdcc4e",-6.1659,39.2026,80,"spices,snorkeling,history","Stone Town|Nungwi Beach|Spice tour","June–October"),
            D(12,"Maui","United States","Lahaina","Volcanic craters, whale watching, and the Road to Hana.","beach","1542259009477-d625272157b7",20.7984,-156.3319,250,"volcanoes,surfing,whales","Haleakalā Sunrise|Road to Hana|Molokini Snorkeling","April–May, Sep–Nov"),
            D(13,"Seychelles","Seychelles","Mahé","Granite boulders, giant tortoises, and pristine Indian Ocean coves.","beach","1589979481223-deb893043163",-4.6796,55.492,300,"luxury,nature,snorkeling","Anse Source d'Argent|Vallée de Mai|Giant tortoises","April–May, Oct–Nov"),

            // ── City ──
            D(4,"Barcelona","Spain","Barcelona","Gaudí architecture, Mediterranean beaches, and vibrant nightlife.","city","1583422409516-2895a77efded",41.3851,2.1734,150,"architecture,food,beach","Sagrada Família|Gothic Quarter|Barceloneta","April–June, Sep–Oct",true),
            D(14,"Tokyo","Japan","Tokyo","Neon-lit metropolis blending ultramodern and traditional.","city","1540959733332-eab8343a890d",35.6762,139.6503,130,"food,technology,anime","Shibuya Crossing|Senso-ji Temple|Tsukiji Market","March–May, Oct–Nov",true),
            D(15,"Paris","France","Paris","The City of Light — art, fashion, cuisine, and the Eiffel Tower.","city","1502602898657-3e91760cbb34",48.8566,2.3522,200,"art,food,romance","Eiffel Tower|Louvre Museum|Montmartre","April–June, Sep–Oct",true),
            D(16,"New York","United States","New York","The city that never sleeps — Broadway, Central Park, and pizza.","city","1496442226666-8d4d0e62e6e9",40.7128,-74.006,280,"broadway,food,shopping","Central Park|Times Square|Statue of Liberty","April–June, Sep–Nov",true),
            D(17,"Dubai","United Arab Emirates","Dubai","Futuristic skyline, desert safaris, and luxury shopping.","city","1512453913507-d187c340770a",25.2048,55.2708,200,"luxury,shopping,desert","Burj Khalifa|Dubai Mall|Desert safari","November–March",true),
            D(18,"London","United Kingdom","London","Royal palaces, world-class museums, and afternoon tea.","city","1513635269975-59663e0ac1ad",51.5074,-0.1278,220,"history,theatre,pubs","Tower of London|British Museum|West End","May–September"),
            D(19,"Singapore","Singapore","Singapore","Garden city-state with hawker food, Marina Bay, and Sentosa.","city","1525625293386-3f8f99389edd",1.3521,103.8198,180,"food,gardens,clean","Marina Bay Sands|Gardens by the Bay|Hawker centres","February–April"),
            D(20,"Istanbul","Turkey","Istanbul","Where East meets West — bazaars, mosques, and Bosphorus cruises.","city","1524231757912-21f4fe3a7200",41.0082,28.9784,70,"history,bazaars,food","Hagia Sophia|Grand Bazaar|Bosphorus cruise","April–May, Sep–Nov"),
            D(21,"Rome","Italy","Rome","Eternal City of emperors — Colosseum, Vatican, and gelato.","city","1552832230-c0197dd311b5",41.9028,12.4964,160,"history,food,art","Colosseum|Vatican Museums|Trevi Fountain","April–June, Sep–Oct"),
            D(22,"Sydney","Australia","Sydney","Harbour icons, golden beaches, and laid-back Aussie culture.","city","1506973035872-a4ec16b8e8d9",-33.8688,151.2093,190,"beaches,opera,surfing","Sydney Opera House|Bondi Beach|Harbour Bridge","September–November"),
            D(23,"Mumbai","India","Mumbai","Bollywood, street food, colonial grandeur, and the Arabian Sea.","city","1570168007204-dfb528c6958f",19.076,72.8777,40,"food,bollywood,history","Gateway of India|Marine Drive|Dharavi tour","October–March"),
            D(24,"Hong Kong","China","Hong Kong","Dizzying skyline, dim sum, and Victoria Peak views.","city","1536599018102-9f803c029b22",22.3193,114.1694,170,"food,skyline,shopping","Victoria Peak|Star Ferry|Temple Street Market","October–December"),

            // ── Cultural ──
            D(2,"Kyoto","Japan","Kyoto","Temples, tea houses, and timeless Japanese culture.","cultural","1493976040374-85c8e12f0c0e",35.0116,135.7681,140,"temples,tea,gardens","Fushimi Inari|Arashiyama bamboo|Gion district","March–May, Oct–Nov",true),
            D(25,"Marrakech","Morocco","Marrakech","Medina souks, riads, and the Atlas Mountains backdrop.","cultural","1489749798305-4fea3ae63d43",31.6295,-7.9811,60,"souks,riads,spices","Jemaa el-Fnaa|Majorelle Garden|Atlas Mountains","March–May, Sep–Nov"),
            D(26,"Cusco","Peru","Cusco","Gateway to Machu Picchu and Inca heritage in the Andes.","cultural","1526392060635-9d6019884377",-13.532,-71.9675,50,"ruins,andes,history","Machu Picchu|Sacred Valley|Rainbow Mountain","May–September"),
            D(27,"Varanasi","India","Varanasi","India's spiritual heart — Ganges ghats and ancient rituals.","cultural","1561361058-c24cecae35ca",25.3176,82.9739,25,"spiritual,ganges,temples","Ganga Aarti|Dashashwamedh Ghat|Sarnath","October–March"),
            D(28,"Cairo","Egypt","Cairo","Pyramids, pharaohs, and the mighty Nile.","cultural","1572252009286-268acec5ca0a",30.0444,31.2357,45,"pyramids,history,nile","Great Pyramids|Egyptian Museum|Khan el-Khalili","October–April"),
            D(29,"Petra","Jordan","Wadi Musa","Rose-red city carved into desert cliffs by the Nabataeans.","cultural","1579606032821-4e6161c81c86",30.3285,35.4444,80,"archaeology,desert,hiking","The Treasury|The Monastery|Siq canyon","March–May, Sep–Nov"),
            D(30,"Siem Reap","Cambodia","Siem Reap","Ancient Angkor temples rising from tropical jungle.","cultural","1600000418916-3ef26d36c01b",13.3671,103.8448,30,"temples,jungle,history","Angkor Wat|Bayon Temple|Ta Prohm","November–March"),
            D(31,"Athens","Greece","Athens","Birthplace of democracy with the Acropolis watching over.","cultural","1555993539-1b2e5c58e0d7",37.9838,23.7275,100,"acropolis,philosophy,food","Acropolis|Plaka|Ancient Agora","April–June, Sep–Oct"),

            // ── Mountains ──
            D(3,"Banff","Canada","Banff","Rocky Mountain peaks, turquoise lakes, and alpine adventure.","mountains","1503614472-8c93d56e92ce",51.1784,-115.5708,200,"hiking,lakes,winter","Lake Louise|Moraine Lake|Banff Gondola","June–Sep, Dec–Mar",true),
            D(32,"Swiss Alps","Switzerland","Interlaken","Snow-capped peaks, chocolate, and precision railways.","mountains","1530122037265-83aee0480052",46.6863,7.8632,300,"skiing,trains,chocolate","Jungfrau|Lauterbrunnen Valley|Glacier Express","June–Sep, Dec–Mar",true),
            D(33,"Patagonia","Argentina","El Chaltén","Raw wilderness of glaciers, granite spires, and steppe.","mountains","1519681393784-d120267933ba",-49.3315,-72.886,120,"trekking,glaciers,wildlife","Perito Moreno Glacier|Torres del Paine|Fitz Roy","October–March"),
            D(34,"Leh-Ladakh","India","Leh","High-altitude desert with monasteries and Pangong Lake.","mountains","1544735716-ea9ef0a14fb4",34.1526,77.5771,40,"monasteries,passes,lakes","Pangong Lake|Nubra Valley|Khardung La","June–September"),
            D(35,"Dolomites","Italy","Cortina","Dramatic pink-hued peaks and alpine meadows in northern Italy.","mountains","1501854140801-ce89f857b5b7",46.4102,11.8441,180,"via-ferrata,skiing,hiking","Tre Cime|Seceda|Lago di Braies","June–Sep, Dec–Mar"),

            // ── Adventure ──
            D(5,"Queenstown","New Zealand","Queenstown","Adventure capital with bungee, skiing, and fjord scenery.","adventure","1507699622108-4be3abd695ad",-45.0312,168.6626,175,"bungee,ski,lake","Milford Sound|Skyline Gondola|Jet boating","Year-round"),
            D(36,"Iceland","Iceland","Reykjavik","Fire and ice — volcanoes, glaciers, geysers, and northern lights.","adventure","1504829857797-deb22ed9158a",64.1466,-21.9426,220,"aurora,glaciers,geysers","Golden Circle|Blue Lagoon|Northern Lights","June–Aug, Sep–Mar for aurora",true),
            D(37,"Costa Rica","Costa Rica","La Fortuna","Rainforests, zip-lines, sloths, and Pacific surf.","adventure","1518259102261-b40117eabbc8",10.4699,-84.6427,90,"wildlife,rainforest,surfing","Arenal Volcano|Monteverde|Manuel Antonio","December–April"),
            D(38,"Kruger","South Africa","Kruger","Big Five safaris on the African savanna.","adventure","1516426122078-f30e1c35ee33",-24.0113,31.4854,150,"safari,wildlife,big-five","Big Five game drives|Panorama Route|Bush walks","May–September"),
            D(39,"Galápagos","Ecuador","Puerto Ayora","Darwin's living laboratory — giant tortoises and marine iguanas.","adventure","1544551763-46a013bb70d5",-0.7432,-90.3038,250,"wildlife,diving,endemic","Giant tortoises|Blue-footed boobies|Snorkeling","June–November"),
            D(40,"Nepal","Nepal","Kathmandu","Himalayan trekking, Everest Base Camp, and Buddhist serenity.","adventure","1544735716-392fe2489fcd",27.7172,85.324,35,"trekking,everest,temples","Everest Base Camp|Annapurna Circuit|Boudhanath","Oct–Nov, Mar–May"),

            // ── Nature ──
            D(41,"Norwegian Fjords","Norway","Bergen","Dramatic sea-carved valleys and midnight sun.","nature","1507272931001-fc06c17866f4",60.3913,5.3221,230,"fjords,midnight-sun,hiking","Geirangerfjord|Trolltunga|Flåm Railway","May–September"),
            D(42,"Great Barrier Reef","Australia","Cairns","World's largest coral reef teeming with marine life.","nature","1582967788606-a171c7e0f7fc",-16.9186,145.7781,200,"diving,coral,marine","Outer reef diving|Whitehaven Beach|Glass-bottom boat","June–October"),
            D(43,"Cappadocia","Turkey","Göreme","Fairy chimneys, cave hotels, and hot-air balloon sunrises.","nature","1526048598645-62b7c9ee6c7d",38.6431,34.8287,70,"balloons,caves,history","Hot-air balloons|Underground cities|Göreme Open-Air Museum","April–June, Sep–Nov",true),
            D(44,"Amazon","Brazil","Manaus","Earth's greatest rainforest — pink dolphins and canopy walks.","nature","1596587483932-df0c1e6c3a31",-3.1190,-60.0217,100,"jungle,wildlife,river","Canopy walk|Pink river dolphins|Indigenous villages","June–November"),
            D(45,"Yellowstone","United States","West Yellowstone","Geysers, bison herds, and prismatic hot springs.","nature","1529439322271-42e2b71b9ec0",44.428,-110.5885,150,"geysers,wildlife,national-park","Old Faithful|Grand Prismatic Spring|Lamar Valley","May–September"),

            // ── More cities/beach to round out ──
            D(46,"Lisbon","Portugal","Lisbon","Pastel-tiled hills, tram 28, and pastéis de nata.","city","1555881400-74d7acaacd8b",38.7223,-9.1393,100,"food,trams,tiles","Belém Tower|Alfama|Time Out Market","March–October"),
            D(47,"Prague","Czech Republic","Prague","Gothic spires, Charles Bridge, and affordable beer.","city","1541849546-216549ae216d",50.0755,14.4378,80,"beer,architecture,history","Charles Bridge|Old Town Square|Prague Castle","April–June, Sep–Oct"),
            D(48,"Tulum","Mexico","Tulum","Bohemian beach town with Mayan clifftop ruins.","beach","1504681869696-d977211a5f4c",20.2114,-87.4654,100,"ruins,cenotes,yoga","Tulum Ruins|Gran Cenote|Sian Ka'an Biosphere","November–April"),
            D(49,"Jaipur","India","Jaipur","The Pink City — forts, palaces, and Rajasthani colour.","cultural","1477587458883-47145ed94245",26.9124,75.7873,35,"forts,palaces,textiles","Amber Fort|Hawa Mahal|City Palace","October–March"),
            D(50,"Dubrovnik","Croatia","Dubrovnik","Walled Old Town on the Adriatic — the real King's Landing.","city","1555990793-da11153b2473",42.6507,18.0944,130,"walls,adriatic,history","City Walls walk|Lokrum Island|Cable car","May–September")
        );
    }
}
