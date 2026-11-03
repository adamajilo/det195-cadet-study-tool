const photo = c => (IMG[c.g] || {})[c.q];

function renderPortraitGroup(items) {
  if (!items.length) return "";

  return `
    <div class="portrait-group">
      ${items.map(([src, caption]) => `
        <figure class="portrait-item">
          <img class="portrait" src="${esc(src)}" alt="${esc(caption)}" loading="lazy">
          <figcaption>${esc(caption)}</figcaption>
        </figure>
      `).join("")}
    </div>
  `;
}

function photoMarkup(c) {
  const p = photo(c);

  if (!p) return "";

  if (typeof p === "string") {
    return `
      <img class="portrait" src="${esc(p)}" alt="${esc(c.a)}" loading="lazy">
    `;
  }

  if (!Array.isArray(p) && typeof p === "object") {
    const items = [
      p.uurp ? [p.uurp, "Utility Uniform"] : null,
      p.erb ? [p.erb, "Epaulet"] : null
    ].filter(Boolean);

    return renderPortraitGroup(items);
  }

  if (Array.isArray(p)) {
    const items = p.map(item => {
      if (typeof item === "string") {
        return [item, c.a];
      }

      if (Array.isArray(item)) {
        return item[0] ? [item[0], item[1] || c.a] : null;
      }

      return null;
    }).filter(Boolean);

    return renderPortraitGroup(items);
  }

  return "";
}

const S = {
  mode: "flash",
  weeks: new Set(),
  zh: true,
  ac: false,
  flip: false,
  deck: [],
  i: 0,
  shown: false,
  quiz: null,
  rec: null
};

const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch (e) {
      return d;
    }
  },

  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
};

const known = new Set(store.get("wk_known", []));
const keyOf = c => c.w + "|" + c.q;
const $ = s => document.querySelector(s);

const esc = s => String(s).replace(/[&<>"]/g, m => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
}[m]));

const shuffle = a => {
  a = a.slice();

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
};

const today = () => {
  const d = new Date();

  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
};

const nextTest = () =>
  SCHED.find(s => s.d >= today() && s.w !== 0) ||
  SCHED[SCHED.length - 1];

const fmt = d =>
  new Date(d + "T12:00").toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

function presetWeeks(p) {
  if (p === "mid") return [1, 2, 3, 4];
  if (p === "final") return WEEKS.slice();

  const n = nextTest();

  if (n.w === 5) return [1, 2, 3, 4];
  if (n.w === 9) return WEEKS.slice();

  return [n.w];
}

function pool() {
  return C.filter(c =>
    S.weeks.has(c.w) &&
    (c.kind !== "zh" || S.zh) &&
    (c.kind !== "ac" || S.ac)
  );
}

function side(c, back) {
  const f = S.flip;
  const showA = back !== f;

  return showA ? c.a : c.q;
}

const wc = $("#weekChips");

WEEKS.forEach(w => {
  const b = document.createElement("button");

  b.className = "chip";
  b.id = "wk" + w;
  b.textContent = "Week " + w;
  b.dataset.w = w;

  b.onclick = () => {
    S.weeks.has(w) ? S.weeks.delete(w) : S.weeks.add(w);
    sync();
    rebuild();
  };

  wc.appendChild(b);
});

document.querySelectorAll("[data-preset]").forEach(b => {
  b.onclick = () => {
    S.weeks = new Set(presetWeeks(b.dataset.preset));
    sync();
    rebuild();
  };
});

$("#incZh").onclick = () => {
  S.zh = !S.zh;
  sync();
  rebuild();
};

$("#incAc").onclick = () => {
  S.ac = !S.ac;
  sync();
  rebuild();
};

$("#flip").onclick = () => {
  S.flip = !S.flip;
  sync();
  rebuild();
};

document.querySelectorAll(".tab").forEach(t => {
  t.onclick = () => {
    S.mode = t.dataset.mode;
    store.set("wk_mode", S.mode);
    sync();
    rebuild();
  };
});

function sync() {
  WEEKS.forEach(w => {
    $("#wk" + w).setAttribute("aria-pressed", S.weeks.has(w));
  });

  $("#incZh").setAttribute("aria-pressed", S.zh);
  $("#incAc").setAttribute("aria-pressed", S.ac);
  $("#flip").setAttribute("aria-pressed", S.flip);

  document.querySelectorAll(".tab").forEach(t => {
    t.setAttribute("aria-selected", t.dataset.mode === S.mode);
  });

  $("#filters").hidden = S.mode === "sched";

  store.set("wk_weeks", [...S.weeks]);
  store.set("wk_opts", {
    zh: S.zh,
    ac: S.ac,
    flip: S.flip
  });
}

function rebuild() {
  if (S.mode === "flash") {
    S.deck = shuffle(pool());
    S.i = 0;
    S.shown = false;
    renderFlash();
  } else if (S.mode === "quiz") {
    startQuiz();
  } else if (S.mode === "recite") {
    S.rec = null;
    renderRecite();
  } else {
    renderSched();
  }
}

function empty() {
  $("#view").innerHTML =
    '<p>No cards match your filters. Choose at least one week, or tap <b>Up next</b>.</p>';
}

function renderFlash() {
  const d = S.deck;

  if (!d.length) return empty();

  const c = d[S.i];
  const k = d.filter(x => known.has(keyOf(x))).length;
  const txt = side(c, S.shown);
  const zh = c.kind === "zh" && (S.shown !== S.flip);
  const pic = photo(c);
  const showPic = pic && (S.shown !== S.flip);

  $("#view").innerHTML = `
    <div class="meta">
      <span>Week ${c.w}, ${esc(c.g)}</span>
      <span>Card ${S.i + 1} of ${d.length}, ${k} known</span>
    </div>

    <div class="bar" style="margin-top:8px">
      <i style="width:${(S.i + 1) / d.length * 100}%"></i>
    </div>

    <div class="card ${S.shown ? "back" : ""}" id="fc" tabindex="0" role="button" aria-label="Flip card">
      <div class="side">${S.shown ? "Back" : "Front"}. Tap the card or press space to flip.</div>
      ${showPic ? photoMarkup(c) : ""}
      <div class="txt ${zh ? "zh" : ""}">${esc(txt)}</div>
    </div>

    <div class="btns">
      <button class="btn" id="prev">Previous</button>
      <button class="btn bad" id="again">Need practice</button>
      <button class="btn good" id="got">Know it</button>
      <button class="btn" id="nextc">Skip</button>
      <button class="btn" id="shuf">Shuffle</button>
      <button class="btn" id="unk">Unknown only</button>
    </div>
  `;

  $("#fc").onclick = flipCard;
  $("#prev").onclick = () => move(-1);
  $("#nextc").onclick = () => move(1);

  $("#got").onclick = () => {
    known.add(keyOf(c));
    store.set("wk_known", [...known]);
    move(1);
  };

  $("#again").onclick = () => {
    known.delete(keyOf(c));
    store.set("wk_known", [...known]);
    move(1);
  };

  $("#shuf").onclick = () => {
    S.deck = shuffle(S.deck);
    S.i = 0;
    S.shown = false;
    renderFlash();
  };

  $("#unk").onclick = () => {
    const u = pool().filter(x => !known.has(keyOf(x)));

    if (!u.length) {
      $("#view").insertAdjacentHTML(
        "beforeend",
        '<p class="note" style="text-align:center">Every card in this set is marked as known. <button class="btn" id="reset">Clear marks</button></p>'
      );

      $("#reset").onclick = () => {
        pool().forEach(x => known.delete(keyOf(x)));
        store.set("wk_known", [...known]);
        rebuild();
      };

      return;
    }

    S.deck = shuffle(u);
    S.i = 0;
    S.shown = false;
    renderFlash();
  };
}

function flipCard() {
  S.shown = !S.shown;
  renderFlash();
  $("#fc").focus();
}

function move(n) {
  if (!S.deck.length) return;

  S.i = (S.i + n + S.deck.length) % S.deck.length;
  S.shown = false;
  renderFlash();
}

document.addEventListener("keydown", e => {
  if (S.mode !== "flash" || e.target.tagName === "INPUT") return;

  if (e.key === " ") {
    e.preventDefault();
    flipCard();
  }

  if (e.key === "ArrowRight") move(1);
  if (e.key === "ArrowLeft") move(-1);
});

function startQuiz(len) {
  const p = pool();

  if (p.length < 4) {
    return p.length
      ? ($("#view").innerHTML = "<p>A quiz needs at least 4 cards. Add another week to continue.</p>")
      : empty();
  }

  const n = len || Math.min(20, p.length);

  const qs = shuffle(p).slice(0, n).map(c => {
    let same = p.filter(x => x.g === c.g && x !== c);

    if (same.length < 3) {
      same = same.concat(
        shuffle(p.filter(x => x.g !== c.g && x.w === c.w))
      );
    }

    if (same.length < 3) {
      same = same.concat(shuffle(p.filter(x => x !== c)));
    }

    const right = side(c, true);
    const opts = [right];

    for (const x of shuffle(same)) {
      const v = side(x, true);

      if (!opts.includes(v)) opts.push(v);
      if (opts.length === 4) break;
    }

    return {
      c,
      prompt: side(c, false),
      right,
      opts: shuffle(opts)
    };
  });

  S.quiz = {
    qs,
    i: 0,
    score: 0,
    missed: [],
    picked: null,
    n
  };

  renderQuiz();
}

function renderQuiz() {
  const Q = S.quiz;

  if (Q.i >= Q.qs.length) {
    const pct = Math.round(Q.score / Q.qs.length * 100);

    $("#view").innerHTML = `
      <div style="text-align:center">
        <div class="score">${Q.score} / ${Q.qs.length}</div>

        <p style="color:${pct >= 80 ? "var(--good)" : pct >= 60 ? "var(--warn)" : "var(--bad)"};font-weight:700">
          ${pct}%
        </p>

        <div class="btns">
          <button class="btn primary" id="again">New quiz</button>
          ${Q.missed.length ? '<button class="btn" id="retry">Retry missed</button>' : ""}
          <button class="btn" id="all">Quiz all ${pool().length} cards</button>
        </div>

        ${Q.missed.length
          ? '<div class="missed">' +
            Q.missed.map(m =>
              `<div><b>${esc(m.prompt)}</b><br>${esc(m.right).replace(/\n/g, "<br>")}</div>`
            ).join("") +
            "</div>"
          : ""}
      </div>
    `;

    $("#again").onclick = () => startQuiz();
    $("#all").onclick = () => startQuiz(pool().length);

    if (Q.missed.length) {
      $("#retry").onclick = () => {
        S.quiz = {
          qs: shuffle(Q.missed).map(m => ({
            ...m,
            opts: shuffle(m.opts)
          })),
          i: 0,
          score: 0,
          missed: [],
          picked: null
        };

        renderQuiz();
      };
    }

    return;
  }

  const q = Q.qs[Q.i];

  $("#view").innerHTML = `
    <div class="meta">
      <span>Week ${q.c.w}, ${esc(q.c.g)}</span>
      <span>Question ${Q.i + 1} of ${Q.qs.length}, score ${Q.score}</span>
    </div>

    <div class="bar" style="margin-top:8px">
      <i style="width:${Q.i / Q.qs.length * 100}%"></i>
    </div>

    <div class="q ${q.c.kind === "zh" && S.flip ? "zh" : ""}">
      ${esc(q.prompt)}
    </div>

    <div class="opts">
      ${q.opts.map((o, j) =>
        `<button class="opt" data-j="${j}" id="o${j}">${esc(o)}</button>`
      ).join("")}
    </div>

    <div class="btns" style="margin-top:14px">
      <button class="btn primary" id="qn" hidden>Next question</button>
    </div>
  `;

  document.querySelectorAll(".opt").forEach(b => {
    b.onclick = () => {
      if (Q.picked !== null) return;

      Q.picked = +b.dataset.j;

      const ok = q.opts[Q.picked] === q.right;

      if (ok) {
        Q.score++;
      } else {
        Q.missed.push(q);
      }

      document.querySelectorAll(".opt").forEach((x, j) => {
        if (q.opts[j] === q.right) {
          x.classList.add("right");
        } else if (j === Q.picked) {
          x.classList.add("wrong");
        }
      });

      if (photo(q.c)) {
        $(".opts").insertAdjacentHTML(
          "afterend",
          `<div class="reveal">${photoMarkup(q.c)}</div>`
        );
      }

      $("#qn").hidden = false;
      $("#qn").focus();
    };
  });

  $("#qn").onclick = () => {
    Q.i++;
    Q.picked = null;
    renderQuiz();
  };
}

function renderRecite() {
  const items = R.filter(r => S.weeks.has(r.w));

  if (!S.rec) {
    if (!items.length) return empty();

    $("#view").innerHTML = `
      <p style="margin-top:0">
        Choose a set to recite. Say each line out loud, then tap the line to check yourself.
      </p>

      <div class="list">
        ${items.map(r => `
          <button class="ritem" data-i="${R.indexOf(r)}" id="r${R.indexOf(r)}">
            ${esc(r.t)}
            <span>Week ${r.w}${r.l.length ? ", " + r.l.filter(x => x[0] !== "#").length + " lines" : ", check against the guide"}</span>
          </button>
        `).join("")}
      </div>
    `;

    document.querySelectorAll(".ritem").forEach(b => {
      b.onclick = () => {
        S.rec = {
          r: R[+b.dataset.i],
          shown: 0,
          hint: false
        };

        renderRecite();
      };
    });

    return;
  }

  const { r } = S.rec;

  if (!r.l.length) {
    $("#view").innerHTML = `
      <div class="meta">
        <span>Week ${r.w}</span>
        <span>${esc(r.t)}</span>
      </div>

      <p class="q">Say or write the ${esc(r.t)} from memory first.</p>

      <p>When you finish, open the study guide to Week 4, page 7 and compare line by line.</p>

      <div class="btns">
        <button class="btn" id="rback">Back to list</button>
      </div>
    `;

    $("#rback").onclick = () => {
      S.rec = null;
      renderRecite();
    };

    return;
  }

  const lines = r.l;
  const body = lines.filter(x => x[0] !== "#");
  let idx = 0;

  const html = lines.map(x => {
    if (x[0] === "#") {
      return `<div class="ln head">${esc(x.slice(1))}</div>`;
    }

    const k = idx++;

    if (k < S.rec.shown) {
      return `<div class="ln">${esc(x)}</div>`;
    }

    if (S.rec.hint) {
      return `
        <div class="ln hint" data-k="${k}">
          ${esc(x.split(" ").map(w =>
            w.replace(/[A-Za-z0-9']+/, m =>
              m[0] + "_".repeat(Math.max(0, m.length - 1))
            )
          ).join(" "))}
        </div>
      `;
    }

    return `<div class="ln hide" data-k="${k}">${esc(x)}</div>`;
  }).join("");

  $("#view").innerHTML = `
    <div class="meta">
      <span>Week ${r.w}</span>
      <span>${S.rec.shown} of ${body.length} lines shown</span>
    </div>

    <h2 style="font-family:var(--display);font-size:1.6rem;margin:8px 0 0;text-transform:uppercase">
      ${esc(r.t)}
    </h2>

    <div class="lines">${html}</div>

    <div class="btns">
      <button class="btn" id="rback">Back to list</button>
      <button class="btn primary" id="rnext">Show next line</button>
      <button class="btn" id="rhint" aria-pressed="${S.rec.hint}">${S.rec.hint ? "Hide hints" : "Letter hints"}</button>
      <button class="btn" id="rall">Show all</button>
      <button class="btn" id="rreset">Start over</button>
    </div>
  `;

  $("#rback").onclick = () => {
    S.rec = null;
    renderRecite();
  };

  $("#rnext").onclick = () => {
    S.rec.shown = Math.min(body.length, S.rec.shown + 1);
    renderRecite();
  };

  $("#rhint").onclick = () => {
    S.rec.hint = !S.rec.hint;
    renderRecite();
  };

  $("#rall").onclick = () => {
    S.rec.shown = body.length;
    renderRecite();
  };

  $("#rreset").onclick = () => {
    S.rec.shown = 0;
    renderRecite();
  };

  document.querySelectorAll(".ln[data-k]").forEach(el => {
    el.onclick = () => {
      S.rec.shown = Math.max(
        S.rec.shown,
        +el.dataset.k + 1
      );

      renderRecite();
    };
  });
}

function renderSched() {
  const n = nextTest();

  $("#view").innerHTML = `
    <div class="tw">
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Date</th>
            <th>Test</th>
            <th>Covers</th>
          </tr>
        </thead>

        <tbody>
          ${SCHED.map(s => `
            <tr class="${s.big ? "big" : ""} ${s === n ? "now" : ""}">
              <td>${s.w || "—"}</td>
              <td>${fmt(s.d)}</td>
              <td>${esc(s.t)}</td>
              <td>${esc(s.f)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <p class="note">
      The guide's schedule table, midterm list and final list don't always agree on which week a topic belongs to. For example, the midterm list puts Counseling and Chain of Command in Week 4. This trainer sorts each topic by where it appears in the guide, so confirm with your flight if a test covers something unexpected.
    </p>
  `;
}

(function() {
  const n = nextTest();

  $("#next").innerHTML = `Up next: <b>${esc(n.t)}</b>, ${fmt(n.d)}`;

  const w = store.get("wk_weeks", null);
  S.weeks = new Set(w && w.length ? w : presetWeeks("next"));

  const o = store.get("wk_opts", {});

  if (typeof o.zh === "boolean") S.zh = o.zh;
  if (typeof o.ac === "boolean") S.ac = o.ac;
  if (typeof o.flip === "boolean") S.flip = o.flip;

  const m = store.get("wk_mode", "flash");

  if (["flash", "quiz", "recite", "sched"].includes(m)) {
    S.mode = m;
  }

  sync();
  rebuild();
})();