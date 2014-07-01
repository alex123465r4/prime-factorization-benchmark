/*!
 * Webogram v0.1.8 - messaging web application for MTProto
 * https://github.com/zhukov/webogram
 * Copyright (C) 2014 Igor Zhukov <igor.beatle@gmail.com>
 * https://github.com/zhukov/webogram/blob/master/LICENSE
 */

function bigint (num) {
  return new BigInteger(num.toString(16), 16);
}

function bigStringInt (strNum) {
  return new BigInteger(strNum, 10);
}

function dHexDump (bytes) {
  var arr = [];
  for (var i = 0; i < bytes.length; i++) {
    if (i && !(i % 2)) {
      if (!(i % 16)) {
        arr.push("\n");
      } else if (!(i % 4)) {
        arr.push('  ');
      } else {
        arr.push(' ');
      }
    }
    arr.push((bytes[i] < 16 ? '0' : '') + bytes[i].toString(16));
  }

  console.log(arr.join(''));
}

function bytesToHex (bytes) {
  bytes = bytes || [];
  var arr = [];
  for (var i = 0; i < bytes.length; i++) {
    arr.push((bytes[i] < 16 ? '0' : '') + (bytes[i] || 0).toString(16));
  }
  return arr.join('');
}

function bytesFromHex (hexString) {
  var len = hexString.length,
      i,
      bytes = [];

  for (i = 0; i < len; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }

  return bytes;
}

function bytesToBase64 (bytes) {
  var mod3, result = '';

  for (var nLen = bytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    mod3 = nIdx % 3;
    nUint24 |= bytes[nIdx] << (16 >>> mod3 & 24);
    if (mod3 === 2 || nLen - nIdx === 1) {
      result += String.fromCharCode(
        uint6ToBase64(nUint24 >>> 18 & 63),
        uint6ToBase64(nUint24 >>> 12 & 63),
        uint6ToBase64(nUint24 >>> 6 & 63),
        uint6ToBase64(nUint24 & 63)
      );
      nUint24 = 0;
    }
  }

  return result.replace(/A(?=A$|$)/g, '=');
}

function uint6ToBase64 (nUint6) {
  return nUint6 < 26
    ? nUint6 + 65
    : nUint6 < 52
      ? nUint6 + 71
      : nUint6 < 62
        ? nUint6 - 4
        : nUint6 === 62
          ? 43
          : nUint6 === 63
            ? 47
            : 65;
}

function bytesCmp (bytes1, bytes2) {
  var len = bytes1.length;
  if (len != bytes2.length) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (bytes1[i] != bytes2[i]) {
      return false;
    }
  }
  return true;
}

function bytesXor (bytes1, bytes2) {
  var len = bytes1.length,
      bytes = [];

  for (var i = 0; i < len; ++i) {
      bytes[i] = bytes1[i] ^ bytes2[i];
  }

  return bytes;
}

function bytesToWords (bytes) {
  var len = bytes.length,
      words = [];

  for (var i = 0; i < len; i++) {
      words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }

  return new CryptoJS.lib.WordArray.init(words, len);
}

function bytesFromWords (wordArray) {
  var words = wordArray.words,
      sigBytes = wordArray.sigBytes,
      bytes = [];

  for (var i = 0; i < sigBytes; i++) {
      bytes.push((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
  }

  return bytes;
}

function bytesFromBigInt (bigInt, len) {
  var bytes = bigInt.toByteArray();

  while (!bytes[0] && (!len || bytes.length > len)) {
    bytes = bytes.slice(1);
  }

  return bytes;
}

function bytesFromLeemonBigInt (bigInt, len) {
  var str = bigInt2str(bigInt, 16);
  return bytesFromHex(str);
}


function bytesToArrayBuffer (b) {
  return (new Uint8Array(b)).buffer;
}

function bytesFromArrayBuffer (buffer) {
  var len = buffer.byteLength,
      byteView = new Uint8Array(buffer),
      bytes = [];

  for (var i = 0; i < len; ++i) {
      bytes[i] = byteView[i];
  }

  return bytes;
}

function longToInts (sLong) {
  var divRem = bigStringInt(sLong).divideAndRemainder(bigint(0x100000000));

  return [divRem[0].intValue(), divRem[1].intValue()];
}

function longToBytes (sLong) {
  return bytesFromWords({words: longToInts(sLong), sigBytes: 8}).reverse();
}

function longFromInts (high, low) {
  return bigint(high).shiftLeft(32).add(bigint(low)).toString(10);
}

function intToUint (val) {
  val = parseInt(val);
  if (val < 0) {
    val = val + 4294967296;
  }
  return val;
}

function uintToInt (val) {
  if (val > 2147483647) {
    val = val - 4294967296;
  }
  return val;
}

function sha1Hash (bytes) {
  // console.log('SHA-1 hash start');
  var hashBytes = sha1.hash(bytes, true);
  // console.log('SHA-1 hash finish');

  return hashBytes;
}



function rsaEncrypt (publicKey, bytes) {
  var needPadding = 255 - bytes.length;
  if (needPadding > 0) {
    var padding = new Array(needPadding);
    (new SecureRandom()).nextBytes(padding);

    bytes = bytes.concat(padding);
  }

  // console.log('RSA encrypt start');
  var N = new BigInteger(publicKey.modulus, 16),
      E = new BigInteger(publicKey.exponent, 16),
      X = new BigInteger(bytes),
      encryptedBigInt = X.modPowInt(E, N),
      encryptedBytes  = bytesFromBigInt(encryptedBigInt, 256);

  // console.log('RSA encrypt finish');

  return encryptedBytes;
}

function aesEncrypt (bytes, keyBytes, ivBytes) {
  // console.log('AES encrypt start', bytes.length/*, bytesToHex(keyBytes), bytesToHex(ivBytes)*/);

  var needPadding = 16 - (bytes.length % 16);
  if (needPadding > 0 && needPadding < 16) {
    var padding = new Array(needPadding);
    (new SecureRandom()).nextBytes(padding);

    bytes = bytes.concat(padding);
  }

  var encryptedWords = CryptoJS.AES.encrypt(bytesToWords(bytes), bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  }).ciphertext;

  var encryptedBytes = bytesFromWords(encryptedWords);

  // console.log('AES encrypt finish');

  return encryptedBytes;
}

function aesDecrypt (encryptedBytes, keyBytes, ivBytes) {
  // console.log('AES decrypt start', encryptedBytes.length/*, bytesToHex(keyBytes), bytesToHex(ivBytes)*/);

  var decryptedWords = CryptoJS.AES.decrypt({ciphertext: bytesToWords(encryptedBytes)}, bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  });

  var bytes = bytesFromWords(decryptedWords);

  // console.log('AES decrypt finish');

  return bytes;
}

function gzipUncompress (bytes) {
  // console.log('Gzip uncompress start');
  var result = (new Zlib.Gunzip(bytes)).decompress();
  // console.log('Gzip uncompress finish');
  return result;
}

var randoms = [
  0.6780740048270673, 0.5422933690715581, 0.30996662518009543, 0.9001301566604525, 0.9054833319969475, 0.9372099668253213, 0.6134939463809133, 0.3743047050666064, 0.720164462691173, 0.4749144846573472, 0.03555586002767086, 0.7920057701412588, 0.08314720122143626, 0.5320060723461211, 0.21680369041860104, 0.6776383824180812, 0.34891338529996574, 0.7751508706714958, 0.34898894489742815, 0.19647020567208529, 0.9544210569001734, 0.9291022792458534, 0.571662314934656, 0.1158677211496979, 0.2689141083974391, 0.7450618639122695, 0.48604283877648413, 0.5839178354945034, 0.8878819537349045, 0.3651400178205222, 0.22353393607772887, 0.5924320460762829, 0.398392042145133, 0.9771430240944028, 0.4329377841204405, 0.34162354469299316, 0.42912706919014454, 0.458456116495654, 0.3822974553331733, 0.7806365634314716, 0.4560666654724628, 0.7049665271770209, 0.7891417609062046, 0.12974153365939856, 0.7804364077746868, 0.7609384485986084, 0.6054817030671984, 0.9426297382451594, 0.791126542026177, 0.44311396148987114, 0.9864380673971027, 0.24914549198001623, 0.6320916258264333, 0.06873075827024877, 0.9988854473922402, 0.38619545195251703, 0.03139998274855316, 0.6483559960033745, 0.2342461161315441, 0.4057386093772948, 0.9915605948772281, 0.6447036999743432, 0.8630581710021943, 0.7356764012947679, 0.1750453372951597, 0.5935452107805759, 0.739014214836061, 0.16232014237903059, 0.055378828663378954, 0.8970307866111398, 0.23325247829779983, 0.35152352252043784, 0.3301329438108951, 0.4520612705964595, 0.5275013262871653, 0.06662065419368446, 0.4920310548041016, 0.6937034328002483, 0.027172730304300785, 0.4998889893759042, 0.2769907242618501, 0.3499529252294451, 0.6234606211073697, 0.5613634991459548, 0.8245446688961238, 0.9610400244127959, 0.11377547355368733, 0.1786105539649725, 0.6649315257091075, 0.07798857660964131, 0.2541182669810951, 0.2753731794655323, 0.7260964524466544, 0.9097944954410195, 0.7958247901406139, 0.31169607769697905, 0.7567418422549963, 0.798220542492345, 0.04436244582757354, 0.7635175872128457, 0.5214794962666929, 0.018040532246232033, 0.7152074810583144, 0.7578265292104334, 0.7072212041821331, 0.13921484467573464, 0.907202027272433, 0.23213761439546943, 0.0002215476706624031, 0.9682768350467086, 0.04643344762735069, 0.7309616215061396, 0.7907762078102678, 0.97113205678761, 0.6857494255527854, 0.8935336209833622, 0.5583525109104812, 0.9715452678501606, 0.14918713411316276, 0.33170966780744493, 0.11451130057685077, 0.38668108521960676, 0.7071701227687299, 0.1992538038175553, 0.07904754183255136, 0.3631267372984439, 0.19326517707668245, 0.40534558333456516, 0.7307040710002184, 0.15083649358712137, 0.37753024511039257, 0.4230033785570413, 0.3812784585170448, 0.08954226062633097, 0.24468524241819978, 0.9654453464318067, 0.5321877498645335, 0.8087001391686499, 0.2549282240215689, 0.2567688045091927, 0.8400530198123306, 0.16113770054653287, 0.6141077298671007, 0.5897052015643567, 0.59783766977489, 0.20413847779855132, 0.2722000319045037, 0.7167977837380022, 0.1051818726118654, 0.1326810831669718, 0.4027306952048093, 0.034930562833324075, 0.34009167994372547, 0.43577394052408636, 0.7464077610056847, 0.06906863558106124, 0.1648732724133879, 0.7109983284026384, 0.8433708692900836, 0.07138865487650037, 0.573143531801179, 0.9226262241136283, 0.24403949710540473, 0.4871281301602721, 0.24070769688114524, 0.5821026226039976, 0.6394437169656157, 0.5546629766467959, 0.42532561579719186, 0.09072113153524697, 0.7264007451012731, 0.43479082244448364, 0.009396413806825876, 0.5979039610829204, 0.436461792094633, 0.3653659087140113, 0.28002127609215677, 0.7983946853782982, 0.9785093029495329, 0.3597910893149674, 0.6604565805755556, 0.4331235568970442, 0.5992027982138097, 0.2546342604327947, 0.9006981833372265, 0.48536466294899583, 0.08024384966120124, 0.19115077354945242, 0.8487708002794534, 0.6300962842069566, 0.7099969165865332, 0.849543810589239, 0.7159534047823399, 0.6520298677496612, 0.6216639834456146, 0.7443703191820532, 0.037328516598790884, 0.21069915359839797, 0.01016923040151596, 0.755440307315439, 0.014128221897408366, 0.12270722375251353, 0.02654020511545241, 0.9088983603287488, 0.15017109108157456, 0.15895775891840458, 0.5499525889754295, 0.13478101370856166, 0.004427488194778562, 0.8965012095868587, 0.7390431775711477, 0.5256114227231592, 0.5724843619391322, 0.05984810437075794, 0.7067785675171763, 0.8587173374835402, 0.28818131843581796, 0.10671196435578167, 0.8955590836703777, 0.48046996141783893, 0.8551670340821147, 0.5379578105639666, 0.17335720942355692, 0.8677963372319937, 0.03964473493397236, 0.6263355975970626, 0.8937295500654727, 0.16649459209293127, 0.4962603156454861, 0.9557575928047299, 0.549184798495844, 0.4157712012529373, 0.26663609710521996, 0.2839204166084528, 0.1497731462586671, 0.7352794362232089, 0.72674147807993, 0.7486315132118762, 0.8584761924576014, 0.11750669474713504, 0.1830323780886829, 0.5248784783761948, 0.03390627447515726, 0.6929483695421368, 0.2370737441815436, 0.0005870917811989784, 0.6614178591407835, 0.8988705300725996, 0.13992019998840988, 0.7865367904305458, 0.2933096664492041, 0.771404602797702, 0.7428141895215958, 0.6390388349536806, 0.35006342455744743, 0.6761851473711431, 0.8977986555546522, 0.6263686756137758, 0.690656699705869, 0.2998604280874133, 0.3601045466493815, 0.047703104093670845, 0.703771575121209, 0.9270264375954866, 0.5817290563136339, 0.13902834616601467, 0.5263303855899721, 0.5099109234288335, 0.6034304953645915, 0.5102414132561535, 0.7590516230557114, 0.23481624526903033, 0.7530872207134962, 0.13787914556451142, 0.662307771621272, 0.3877630173228681, 0.6564067387953401, 0.5525979630183429, 0.7888359362259507, 0.5107762929983437, 0.5695938137359917, 0.07918970054015517, 0.975790181197226, 0.5286124562844634, 0.5667921530548483, 0.05938952323049307, 0.3404823655728251, 0.4131796369329095, 0.08721165196038783, 0.5935354349203408, 0.4357135961763561, 0.7017770288512111, 0.5092850583605468, 0.22057088231667876, 0.5407968333456665, 0.8576611923053861, 0.0030583557672798634, 0.003920183749869466, 0.379775061737746, 0.3691395102068782, 0.1337067896965891, 0.15753087145276368, 0.3359098918735981, 0.07221302506513894, 0.4881433895789087, 0.5951695353724062, 0.6604673741385341, 0.777583307120949, 0.7688492510933429, 0.3142575335223228, 0.5916147546377033, 0.6460391052532941, 0.00922123878262937, 0.5897419035900384, 0.26565034640952945, 0.2088848005514592, 0.8937890741508454, 0.16539512970484793, 0.4209589255042374, 0.9597404324449599, 0.3012208838481456, 0.25044808629900217, 0.419877857202664, 0.46578781213611364, 0.21516679227352142, 0.8250188466627151, 0.5080505076330155, 0.6702000445220619, 0.6429071386810392, 0.8722473536618054, 0.5871385491918772, 0.8274045286234468, 0.10827749385498464, 0.7647572665009648, 0.40286235022358596, 0.4417708651162684, 0.3416778633836657, 0.546876760199666, 0.1421466905158013, 0.39667405816726387, 0.34451079927384853, 0.11671472154557705, 0.8197122812271118, 0.4499013607855886, 0.07101513724774122, 0.7716554044745862, 0.42084203800186515, 0.17700793338008225, 0.47403161134570837, 0.9911532227415591, 0.41433315468020737, 0.18042580992914736, 0.9287719107232988, 0.2217280042823404, 0.8483654879964888, 0.11036963132210076, 0.9694735754746944, 0.10423342627473176, 0.9160528734792024, 0.940226033097133, 0.8235516869463027, 0.9431266156025231, 0.7743011817801744, 0.9005427460651845, 0.5631914499681443, 0.36066887178458273, 0.43761038430966437, 0.48983148811385036, 0.646509240847081, 0.6243792767636478, 0.3734872401691973, 0.6667035170830786, 0.7547254643868655, 0.09246791317127645, 0.6041706413961947, 0.777397574391216, 0.407261332962662, 0.025378232123330235, 0.7976332225371152, 0.9663232425227761, 0.5793219301849604, 0.09581685322336853, 0.8965001311153173, 0.7645138236694038, 0.1614468067418784, 0.1695323206949979, 0.7780152321793139, 0.7178580798208714, 0.48506852774880826, 0.7316071281675249, 0.6236773047130555, 0.5713148806244135, 0.6177572617307305, 0.34296158398501575, 0.017159544164314866, 0.49364283634349704, 0.23524127528071404, 0.48614952666684985, 0.39352913619950414, 0.002707915846258402, 0.4615590781904757, 0.8646414401009679, 0.6822893368080258, 0.570820577442646, 0.7117387859616429, 0.6189285782165825, 0.851551225874573, 0.49530186248011887, 0.859691773308441, 0.07395250466652215, 0.4200917442794889, 0.32010904839262366, 0.28391177812591195, 0.8858557373750955, 0.197920692153275, 0.5923644958529621, 0.27596352249383926, 0.6945401101838797, 0.30224555311724544, 0.8577021709643304, 0.7730211506132036, 0.4555168794468045, 0.665189285762608, 0.8952087978832424, 0.22324750339612365, 0.44256870937533677, 0.06926640495657921, 0.7048741194885224, 0.008355993777513504, 0.7131849427241832, 0.9503699343185872, 0.18485979945398867, 0.9371391867753118, 0.2972584362141788, 0.028772071935236454, 0.6658478677272797, 0.04447871958836913, 0.6783737461082637, 0.6844040933065116, 0.27539951959624887, 0.40373064228333533, 0.1982801123522222, 0.1497169395443052, 0.5961134808603674, 0.5743685178458691, 0.37483365274965763, 0.4680828528944403, 0.30502001801505685, 0.5405110365245491, 0.5835463656112552, 0.21129165799356997, 0.03659498621709645, 0.6785244410857558, 0.4704525601118803, 0.6073872616980225, 0.7146180004347116, 0.3268322634976357, 0.32735628448426723, 0.6992479064501822, 0.1943147163838148, 0.7379148153122514, 0.696857322473079, 0.8122564211953431, 0.5456133235711604, 0.13097968278452754, 0.29727057041600347, 0.8039955860003829, 0.31166103086434305, 0.20136452186852694, 0.4464708985760808, 0.16325176507234573, 0.9820651721674949, 0.14866226026788354, 0.5757997869513929, 0.459523692028597, 0.9408699159976095, 0.4068751141894609, 0.8215389740653336, 0.9896603731904179, 0.18648389703594148, 0.7822504288051277, 0.9567951012868434, 0.5889453932177275, 0.03100797114893794, 0.7342907316051424, 0.5700771887786686, 0.06386034982278943, 0.03677977668121457, 0.9832939507905394, 0.6981321033090353, 0.023057034239172935, 0.4975105542689562, 0.779326843097806, 0.5093261611182243, 0.07866336475126445, 0.47898007999174297, 0.3026716853491962, 0.6046712847892195, 0.037193054566159844, 0.6623275901656598, 0.6385049468372017, 0.5687797979917377, 0.3371279872953892, 0.4927885173819959, 0.7103142554406077, 0.6665506165008992, 0.06040498777292669, 0.7706696514505893, 0.2943400149233639, 0.44817390269599855, 0.4174353003036231, 0.909090681001544, 0.8838660253677517, 0.12513366201892495, 0.6020418624393642, 0.029997721780091524, 0.05673343362286687, 0.6754500141832978, 0.43247654009610415, 0.6139614961575717, 0.8771071350201964, 0.5238779236096889, 0.8250662726350129, 0.43059772811830044, 0.36034150677733123, 0.54533934709616, 0.9861411626916379, 0.7011695902328938, 0.5098096753936261, 0.7004209933802485, 0.7146182802971452, 0.35277348500676453, 0.32789711840450764, 0.744134334847331, 0.49423603317700326, 0.31206206418573856, 0.3644116756040603, 0.9582634966354817, 0.23954267520457506, 0.24403223837725818, 0.01784097356721759, 0.013124320423230529, 0.7934980569407344, 0.40162848494946957, 0.1438743497710675, 0.8632803841028363, 0.4995672539807856, 0.6548051538411528, 0.30727435764856637, 0.8585034101270139, 0.27325471956282854, 0.41693088924512267, 0.38031885609962046, 0.521944503299892, 0.554738569771871, 0.7866966295987368, 0.19721189886331558, 0.7388279950246215, 0.4270984772592783, 0.48562894645147026, 0.9670124500989914, 0.31823018472641706, 0.1410801347810775, 0.8152469366323203, 0.040124428225681186, 0.25522042950615287, 0.6189567188266665, 0.0030841634143143892, 0.49500791961327195, 0.04664294235408306, 0.2237109320703894, 0.8495112890377641, 0.02271057921461761, 0.1267603242304176, 0.19608192122541368, 0.9218482370488346, 0.9188987924717367, 0.029424994718283415, 0.8285986215341836, 0.9798684469424188, 0.18354101129807532, 0.9665073272772133, 0.03282123967073858, 0.7407698251772672, 0.07071600086055696, 0.27627702918834984, 0.40439847228117287, 0.46678136265836656, 0.33439733972772956, 0.5548806099686772, 0.2438193114940077, 0.20223822235129774, 0.32050024112686515, 0.472591751255095, 0.5429014198016375, 0.40562142338603735, 0.8470255995634943, 0.625142436241731, 0.3705895834136754, 0.6903868080116808, 0.4885269191581756, 0.01695919595658779, 0.9095235054846853, 0.5792784471996129, 0.24350919341668487, 0.6325630431529135, 0.7106964718550444, 0.6761212984565645, 0.8830665010027587, 0.2825147707480937, 0.3910281169228256, 0.21881616744212806, 0.44308075518347323, 0.2692259408067912, 0.41276835766620934, 0.5390932604204863, 0.9617990739643574, 0.975383616052568, 0.24647188209928572, 0.8348238090984523, 0.8005172240082175, 0.8897206594701856, 0.8843965171836317, 0.5997444812674075, 0.13929708185605705, 0.27136066975072026, 0.3634097857866436, 0.5445260147098452, 0.20933190966024995, 0.05743622430600226, 0.5513571449555457, 0.7582793980836868, 0.026249312097206712, 0.7884638449177146, 0.3934233372565359, 0.13522357330657542, 0.046685090055689216, 0.9598712283186615, 0.7062816398683935, 0.9084679174702615, 0.5326353667769581, 0.8786980982404202, 0.49887517374008894, 0.11204082984477282, 0.2638356238603592, 0.8956482091452926, 0.1972268484532833, 0.04802369885146618, 0.5136608460452408, 0.06073307432234287, 0.8621665351092815, 0.12224501161836088, 0.8982791856396943, 0.11545044532977045, 0.8317356924526393, 0.16273729293607175, 0.8882930330000818, 0.7759482183028013, 0.9982202954124659, 0.5939536727964878, 0.49679161980748177, 0.8337773710954934, 0.6314586733933538, 0.7999667702242732, 0.7953528149519116, 0.6375401609111577, 0.7611512378789485, 0.4691754837986082, 0.20922494772821665, 0.08465877152048051, 0.9730771025642753, 0.8995035644620657, 0.6585955168120563, 0.5671008485369384, 0.6721039703115821, 0.5123543220106512, 0.25589164323173463, 0.01887287152931094, 0.6976387498434633, 0.8317946612369269, 0.4403672725893557, 0.8094850112684071, 0.72815943043679, 0.6999497464857996, 0.13197230198420584, 0.4638433242216706, 0.724267098121345, 0.5034895776771009, 0.2737801633775234, 0.7979485099203885, 0.890876846620813, 0.07428419566713274, 0.5629130911547691, 0.11145891505293548, 0.6863743786234409, 0.08560819993726909, 0.39320086711086333, 0.7568979137577116, 0.8880090187303722, 0.6439607269130647, 0.17182558053173125, 0.7361425401177257, 0.34702004049904644, 0.21731337322853506, 0.8272442426532507, 0.21692262473516166, 0.9905496803112328, 0.1896967338398099, 0.33550972142256796, 0.5529394953045994, 0.8334823176264763, 0.3494636903051287, 0.8562640401069075, 0.5767430360428989, 0.943897427758202, 0.9255015968810767, 0.7663034633733332, 0.7919265881646425, 0.8927790331654251, 0.9255947221536189, 0.42499322816729546, 0.060025614919140935, 0.7327129647601396, 0.8593117638956755, 0.1695493394508958, 0.2514222916215658, 0.22789027681574225, 0.30434109875932336, 0.20529099670238793, 0.1021547014825046, 0.504112480673939, 0.5320924869738519, 0.00711142853833735, 0.08029043208807707, 0.8942829177249223, 0.051910156616941094, 0.5292784753255546, 0.2986269649118185, 0.7303727583494037, 0.9869667482562363, 0.8092356938868761, 0.4193783067166805, 0.4204039638862014, 0.9928947617299855, 0.18529245257377625, 0.034888398833572865, 0.4429973619990051, 0.8238069736398757, 0.544482906581834, 0.5012230789288878, 0.9577213944867253, 0.5188509412109852, 0.11449789558537304, 0.16004372690804303, 0.33649328141473234, 0.6682247617281973, 0.3479698544833809, 0.4854507693089545, 0.5990693119820207, 0.759802179178223, 0.9219485339708626, 0.7490136108826846, 0.8835072305519134, 0.3887275508604944, 0.28399345511570573, 0.29911001259461045, 0.584347854135558, 0.6428322824649513, 0.45418192725628614, 0.37120258645154536, 0.07449565269052982, 0.32154876412823796, 0.6758161559700966, 0.1980775287374854, 0.6008735531941056, 0.5808949579950422, 0.7127803508192301, 0.5817714319564402, 0.6369351253379136, 0.8274658266454935, 0.2374671222642064, 0.28751313174143434, 0.66524280118756, 0.9636601300444454, 0.027058652602136135, 0.6233849746640772, 0.07721212971955538, 0.022516219411045313, 0.2867146839853376, 0.10647292365320027, 0.4339658797252923, 0.7800521543249488, 0.8751565143465996, 0.8807266228832304, 0.6779520518612117, 0.3893394796177745, 0.3796367517206818, 0.9671825203113258, 0.35572969797067344, 0.49015804938971996, 0.4789785665925592, 0.41739854658953846, 0.08120955806225538, 0.016934413695707917, 0.23829786921851337, 0.3968278202228248, 0.15954998834058642, 0.49284828710369766, 0.7760986294597387, 0.6762031428515911, 0.29541608202271163, 0.2183277984149754, 0.49404993816278875, 0.8195660777855664, 0.04568487941287458, 0.027136703953146935, 0.7615625087637454, 0.8272234487812966, 0.8110319543629885, 0.9972379088867456, 0.4801793806254864, 0.5858661371748894, 0.5757009913213551, 0.9084781624842435, 0.7750396959017962, 0.5532510397024453, 0.5325231982860714, 0.8278927856590599, 0.015415252419188619, 0.8429400874301791, 0.7915597243700176, 0.22237674659118056, 0.520712356781587, 0.9259696800727397, 0.29184999177232385, 0.04318745760247111, 0.152881583198905, 0.548227978637442, 0.6259964280761778, 0.9014084299560636, 0.4148011580109596, 0.7989396527409554, 0.05375189450569451, 0.24038426927290857, 0.3271375715266913, 0.7715969881974161, 0.3769601492676884, 0.27959614456631243, 0.9945629860740155, 0.5378405465744436, 0.9816307805012912, 0.44603672227822244, 0.5737320117186755, 0.9012232371605933, 0.05433837044984102, 0.14302232558839023, 0.4311282883863896, 0.9290118177887052, 0.7528094162698835, 0.3126102110836655, 0.47417484037578106, 0.5383830452337861, 0.8741916832514107, 0.24743861332535744, 0.6513427102472633, 0.9439633167348802, 0.06159195676445961, 0.5962803249713033, 0.6168607908766717, 0.8993145334534347, 0.2133837875444442, 0.32351182983256876, 0.40400279755704105, 0.23052119347266853, 0.3045879518613219, 0.6672054727096111, 0.6578789711929858, 0.3976071700453758, 0.4965620986185968, 0.5966727009508759, 0.9875545869581401, 0.646099990233779, 0.23491903208196163, 0.6733641573227942, 0.283284030854702, 0.55256760539487, 0.127162279561162, 0.5932432694826275, 0.14919291413389146, 0.22621307102963328, 0.6052191515918821, 0.05354213365353644, 0.2828268171288073, 0.01504018995910883, 0.7203552122227848, 0.9994380173739046, 0.8843595895450562, 0.07268126960843801, 0.28459376469254494, 0.3639452562201768, 0.30706180538982153, 0.8738601903896779, 0.04881558660417795, 0.20115874987095594, 0.7484669934492558, 0.6448702858760953, 0.8623436186462641, 0.6310046338476241, 0.44321445981040597, 0.8935656151734293, 0.048383407993242145, 0.12077132007107139, 0.6254596968647093, 0.02337998477742076, 0.3325373553670943, 0.41474011028185487, 0.525032744044438, 0.8867509996052831, 0.7157541506458074, 0.037690708646550775, 0.8944970194716007, 0.9435625928454101, 0.879969798726961, 0.7558356248773634, 0.5060667272191495, 0.40381296328268945, 0.935544399311766, 0.0818033313844353, 0.035524952225387096, 0.12475477391853929, 0.394901241408661, 0.9960914757102728, 0.4523771626409143, 0.2896703986916691, 0.03933322010561824, 0.6098365671932697, 0.48505541402846575, 0.4226609810721129, 0.2771389321424067, 0.11666112812235951, 0.6856283301021904, 0.4246938629075885, 0.4166309470310807, 0.12489118846133351, 0.010582673363387585, 0.25975919677875936, 0.4213868889492005, 0.07194038620218635, 0.49313845904543996, 0.04932139511220157, 0.2961913899052888, 0.2635556710883975, 0.9281651391647756, 0.37078553321771324, 0.39958788407966495, 0.6636114751454443, 0.16075180168263614, 0.5943160173483193, 0.9550486118532717, 0.7506346143782139, 0.44807428517378867, 0.5929033269640058, 0.10455025197006762, 0.3875413427595049, 0.3185349712148309, 0.5559706075582653, 0.31470903591252863, 0.618150447960943, 0.5208301495295018, 0.2669119208585471, 0.3320529265329242, 0.560273801907897, 0.946802442194894, 0.8974392779637128, 0.0100499102845788, 0.7163364274892956, 0.3885643028188497, 0.17031163140200078, 0.06136316549964249, 0.198200108949095, 0.66013108426705, 0.5327696113381535, 0.3188649208750576, 0.7305919283535331, 0.17496698605827987, 0.19799881405197084, 0.06709404988214374, 0.04369883635081351, 0.29140523937530816, 0.711293576983735, 0.4551354069262743, 0.6773813236504793, 0.6753613303881139, 0.9325727778486907, 0.06569748860783875, 0.5967205418273807, 0.7038908486720175, 0.3106970030348748, 0.32872570934705436, 0.7888841228559613
  ],
  randomI = 0;

function nextRandomInt (maxValue) {
  if (randomI >= randoms.length) {
    randomI = 0;
  }
  return Math.floor(randoms[randomI++] * maxValue);
};

function pqPrimeFactorization (pqBytes) {
  var what = new BigInteger(pqBytes), 
      result = false;

  console.log('PQ start', pqBytes, what.bitLength());

  try {
    result = pqPrimeLeemon(str2bigInt(what.toString(16), 16, Math.ceil(64 / bpe) + 1))
  } catch (e) {
    console.error(e);
    console.error('Pq leemon Exception', e);
  }

  if (result === false && what.bitLength() <= 64) {
    // console.time('PQ long');
    try {
      result = pqPrimeLong(goog.math.Long.fromString(what.toString(16), 16));
    } catch (e) {
      console.error('Pq long Exception', e);
    };
    // console.timeEnd('PQ long');
  }
  // console.log(result);

  if (result === false) {
    // console.time('pq BigInt');
    result = pqPrimeBigInteger(what);
    // console.timeEnd('pq BigInt');
  }

  console.log('PQ finish');

  return result;
}

function pqPrimeBigInteger (what) {
  var it = 0,
      g;
  for (var i = 0; i < 3; i++) {
    var q = (nextRandomInt(128) & 15) + 17,
        x = bigint(nextRandomInt(1000000000) + 1),
        y = x.clone(),
        lim = 1 << (i + 18);

    for (var j = 1; j < lim; j++) {
      ++it;
      var a = x.clone(),
          b = x.clone(),
          c = bigint(q);

      while (!b.equals(BigInteger.ZERO)) {
        if (!b.and(BigInteger.ONE).equals(BigInteger.ZERO)) {
          c = c.add(a);
          if (c.compareTo(what) > 0) {
            c = c.subtract(what);
          }
        }
        a = a.add(a);
        if (a.compareTo(what) > 0) {
          a = a.subtract(what);
        }
        b = b.shiftRight(1);
      }

      x = c.clone();
      var z = x.compareTo(y) < 0 ? y.subtract(x) : x.subtract(y);
      g = z.gcd(what);
      if (!g.equals(BigInteger.ONE)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        y = x.clone();
      }
    }
    if (g.compareTo(BigInteger.ONE) > 0) {
      break;
    }
  }

  var f = what.divide(g), P, Q;

  if (g.compareTo(f) > 0) {
    P = f;
    Q = g;
  } else {
    P = g;
    Q = f;
  }

  return [bytesFromBigInt(P), bytesFromBigInt(Q)];
}

function gcdLong(a, b) {
  while (a.notEquals(goog.math.Long.ZERO) && b.notEquals(goog.math.Long.ZERO)) {
    while (b.and(goog.math.Long.ONE).equals(goog.math.Long.ZERO)) {
      b = b.shiftRight(1);
    }
    while (a.and(goog.math.Long.ONE).equals(goog.math.Long.ZERO)) {
      a = a.shiftRight(1);
    }
    if (a.compare(b) > 0) {
      a = a.subtract(b);
    } else {
      b = b.subtract(a);
    }
  }
  return b.equals(goog.math.Long.ZERO) ? a : b;
}

function pqPrimeLong(what) {
  var it = 0,
      g;
  for (var i = 0; i < 3; i++) {
    var q = goog.math.Long.fromInt((nextRandomInt(128) & 15) + 17),
        x = goog.math.Long.fromInt(nextRandomInt(1000000000) + 1),
        y = x,
        lim = 1 << (i + 18);

    for (var j = 1; j < lim; j++) {
      ++it;
      var a = x,
          b = x,
          c = q;

      while (b.notEquals(goog.math.Long.ZERO)) {
        if (b.and(goog.math.Long.ONE).notEquals(goog.math.Long.ZERO)) {
          c = c.add(a);
          if (c.compare(what) > 0) {
            c = c.subtract(what);
          }
        }
        a = a.add(a);
        if (a.compare(what) > 0) {
          a = a.subtract(what);
        }
        b = b.shiftRight(1);
      }

      x = c;
      var z = x.compare(y) < 0 ? y.subtract(x) : x.subtract(y);
      g = gcdLong(z, what);
      if (g.notEquals(goog.math.Long.ONE)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        y = x;
      }
    }
    if (g.compare(goog.math.Long.ONE) > 0) {
      break;
    }
  }

  var f = what.div(g), P, Q;

  if (g.compare(f) > 0) {
    P = f;
    Q = g;
  } else {
    P = g;
    Q = f;
  }

  return [bytesFromHex(P.toString(16)), bytesFromHex(Q.toString(16))];
}


function pqPrimeLeemon (what) {
  var minBits = 64,
      minLen = Math.ceil(minBits / bpe) + 1,
      it = 0, i, q, j, lim, g, P, Q,
      a = new Array(minLen),
      b = new Array(minLen),
      c = new Array(minLen),
      g = new Array(minLen),
      z = new Array(minLen),
      x = new Array(minLen),
      y = new Array(minLen);

  for (i = 0; i < 3; i++) {
    q = (nextRandomInt(128) & 15) + 17;
    copyInt_(x, nextRandomInt(1000000000) + 1);
    copy_(y, x);
    lim = 1 << (i + 18);

    for (j = 1; j < lim; j++) {
      ++it;
      copy_(a, x);
      copy_(b, x);
      copyInt_(c, q);

      while (!isZero(b)) {
        if (b[0] & 1) {
          add_(c, a);
          if (greater(c, what)) {
            sub_(c, what);
          }
        }
        add_(a, a);
        if (greater(a, what)) {
          sub_(a, what);
        }
        rightShift_(b, 1);
      }

      copy_(x, c);
      if (greater(x,y)) {
        copy_(z, x);
        sub_(z, y);
      } else {
        copy_(z, y);
        sub_(z, x);
      }
      eGCD_(z, what, g, a, b);
      if (!equalsInt(g, 1)) {
        break;
      }
      if ((j & (j - 1)) == 0) {
        copy_(y, x);
      }
    }
    if (greater(g, one)) {
      break;
    }
  }

  divide_(what, g, x, y);

  if (greater(g, x)) {
    P = x;
    Q = g;
  } else {
    P = g;
    Q = x;
  }

  // console.log(dT(), 'done', bigInt2str(what, 10), bigInt2str(P, 10), bigInt2str(Q, 10));

  return [bytesFromLeemonBigInt(P), bytesFromLeemonBigInt(Q)];
}