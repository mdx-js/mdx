# Attribute formatting

## Block

### Self-closing

<Tag/>

<Tag prop/>

<Tag alpha bravo/>

<Tag alpha="bravo" charlie delta={"echo"} {...props}/>

### Empty

<Tag></Tag>

<Tag prop></Tag>

<Tag alpha bravo></Tag>

<Tag alpha="bravo" charlie delta={"echo"} {...props}></Tag>

### Child

<Tag>Paragraph.</Tag>

<Tag prop>Paragraph.</Tag>

<Tag alpha bravo>Paragraph.</Tag>

<Tag alpha="bravo" charlie delta={"echo"} {...props}>Paragraph.</Tag>

### Children

<Tag>Paragraph.

> Block quote</Tag>

<Tag prop>Paragraph.

> Block quote</Tag>

<Tag alpha bravo>Paragraph.

> Block quote</Tag>

<Tag alpha="bravo" charlie delta={"echo"} {...props}>Paragraph.

> Block quote</Tag>

## Span

### Self-closing

<tag/>.

<tag prop/>.

<tag alpha bravo/>.

<tag alpha="bravo" charlie delta={"echo"} {...props}/>.

### Empty

<tag></tag>.

<tag prop></tag>.

<tag alpha bravo></tag>.

<tag alpha="bravo" charlie delta={"echo"} {...props}></tag>.

### Child

<tag>*Emphasis*</tag>.

<tag prop>*Emphasis*</tag>.

<tag alpha bravo>*Emphasis*</tag>.

<tag alpha="bravo" charlie delta={"echo"} {...props}>*Emphasis*</tag>.

### Children

<tag>*Emphasis* and **importance**</tag>.

<tag prop>*Emphasis* and **importance**</tag>.

<tag alpha bravo>*Emphasis* and **importance**</tag>.

<tag alpha="bravo" charlie delta={"echo"} {...props}>*Emphasis* and **importance**</tag>.
